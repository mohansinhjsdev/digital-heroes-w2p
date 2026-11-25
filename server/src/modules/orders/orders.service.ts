import { prisma } from "../../prisma";
import { AppError } from "../../utils/app-error";
import {
  CreateOrderInput,
  ReorderInput,
  UpdateOrderStatusInput,
} from "./orders.schema";
import { pricingService } from "../pricing/pricing.service";
import { printEngineService } from "../print-engine/print-engine.service";
import { proofsService } from "../proofs/proofs.service";
import { PipelineStatus } from "@prisma/client";

export class OrdersService {
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DH-${year}-${randomSuffix}`;
  }

  async createOrder(customerId: string, data: CreateOrderInput) {
    // 1. Calculate final authoritative pricing
    const pricing = await pricingService.calculatePrice({
      divisionSlug: data.divisionSlug,
      widthMm: data.widthMm,
      heightMm: data.heightMm,
      material: data.material,
      orientation: data.orientation || "PORTRAIT",
      quantity: data.quantity,
    });

    // 2. Resolve division ID
    const division = await prisma.productDivision.findFirst({
      where: { slug: pricing.divisionSlug as any },
    });
    if (!division) {
      throw new AppError(404, "Product division record not found.");
    }

    const orderNumber = this.generateOrderNumber();

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        divisionId: division.id,
        savedDesignId: data.savedDesignId || null,
        status: PipelineStatus.ORDER,
        widthMm: data.widthMm,
        heightMm: data.heightMm,
        material: data.material,
        orientation: data.orientation || "PORTRAIT",
        quantity: data.quantity,
        unitPrice: pricing.unitPrice,
        subtotal: pricing.subtotal,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountSavedTotal,
        taxRate: pricing.taxRate,
        taxAmount: pricing.taxAmount,
        totalPrice: pricing.totalPrice,
        canvasJson: data.canvasJson || null,
        uploadedArtwork: data.uploadedArtwork || null,
        hasCsvData: Boolean(data.hasCsvData),
        csvRawData: data.csvRawData || null,
        csvMappingJson: data.csvMappingJson || null,
      },
      include: {
        division: true,
        customer: { select: { id: true, name: true, email: true, companyName: true } },
      },
    });

    // 4. Automatically generate initial proof revision v1
    try {
      await proofsService.createProofRevision(order.id, customerId, {
        previewImageUrl:
          order.uploadedArtwork ||
          "https://placehold.co/800x600/1e293b/10b981?text=Proof+V1+Preview",
        notes: "Automated initial proof generated on order placement.",
      });
    } catch {
      // Ignored if proof creation can happen later in pipeline
    }

    // 5. Pre-generate print ready files (will remain locked until proof approved)
    try {
      await printEngineService.generateOrderPrintFiles(order.id);
    } catch {
      // Print files can be generated later by staff
    }

    return order;
  }

  async reorder(orderId: string, customerId: string, data: ReorderInput) {
    const original = await prisma.order.findUnique({
      where: { id: orderId },
      include: { division: true },
    });

    if (!original) {
      throw new AppError(404, "Original order not found.");
    }

    if (original.customerId !== customerId) {
      throw new AppError(403, "You can only reorder from your own past jobs.");
    }

    return this.createOrder(customerId, {
      divisionSlug: original.division.slug,
      savedDesignId: original.savedDesignId || undefined,
      widthMm: original.widthMm,
      heightMm: original.heightMm,
      material: data.material || original.material,
      orientation: original.orientation as any,
      quantity: data.quantity || original.quantity,
      canvasJson: original.canvasJson || undefined,
      uploadedArtwork: original.uploadedArtwork || undefined,
      hasCsvData: original.hasCsvData,
      csvRawData: original.csvRawData || undefined,
    });
  }

  async getCustomerOrders(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        division: true,
        proofRevisions: {
          orderBy: { version: "desc" },
          take: 1,
        },
        productionFiles: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrderById(orderId: string, userId: string, isAdmin = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        division: true,
        customer: { select: { id: true, name: true, email: true, companyName: true, phone: true } },
        proofRevisions: {
          include: { proofLogs: { include: { user: { select: { name: true, role: true } } } } },
          orderBy: { version: "desc" },
        },
        productionFiles: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found.");
    }

    if (!isAdmin && order.customerId !== userId) {
      throw new AppError(403, "Unauthorized access to order.");
    }

    return order;
  }

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, "Order not found.");

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: data.status },
      include: { division: true, customer: true },
    });

    return updated;
  }

  async getAdminPipeline(filters: {
    status?: PipelineStatus;
    search?: string;
    divisionSlug?: string;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.divisionSlug) where.division = { slug: filters.divisionSlug as any };
    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        { customer: { name: { contains: filters.search, mode: "insensitive" } } },
        { customer: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    return prisma.order.findMany({
      where,
      include: {
        division: true,
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        proofRevisions: { orderBy: { version: "desc" }, take: 1 },
        productionFiles: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAnalytics() {
    const orders = await prisma.order.findMany({
      include: { division: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === PipelineStatus.COMPLETED).length;

    // Throughput by product division
    const divisionThroughput: Record<string, { count: number; revenue: number }> = {};
    for (const ord of orders) {
      const slug = ord.division.slug;
      if (!divisionThroughput[slug]) {
        divisionThroughput[slug] = { count: 0, revenue: 0 };
      }
      divisionThroughput[slug].count += 1;
      divisionThroughput[slug].revenue += ord.totalPrice;
    }

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      completedOrders,
      pipelineBreakdown: {
        quote: orders.filter((o) => o.status === PipelineStatus.QUOTE).length,
        order: orders.filter((o) => o.status === PipelineStatus.ORDER).length,
        artwork: orders.filter((o) => o.status === PipelineStatus.ARTWORK).length,
        proof: orders.filter((o) => o.status === PipelineStatus.PROOF).length,
        production: orders.filter((o) => o.status === PipelineStatus.PRODUCTION).length,
        completed: completedOrders,
      },
      divisionThroughput,
    };
  }
}

export const ordersService = new OrdersService();
