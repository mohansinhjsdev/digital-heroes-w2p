import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { Role, DivisionSlug, PipelineStatus, ProofStatus } from "@prisma/client";
import { DEFAULT_DIVISIONS } from "../modules/products/products.service";

export async function bootstrapDatabase() {
  try {
    // 1. Seed Product Divisions
    for (const div of DEFAULT_DIVISIONS) {
      await prisma.productDivision.upsert({
        where: { slug: div.slug },
        update: {},
        create: div,
      });
    }

    // 2. Seed Default Admin User
    const adminEmail = "admin@digitalheroes.co.in";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Admin@123", salt);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: "Production Manager",
          role: Role.ADMIN,
          companyName: "Digital Heroes HQ",
        },
      });
    }

    // 3. Seed Default Customer User
    const customerEmail = "customer@demo.com";
    let customer = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (!customer) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Customer@123", salt);
      customer = await prisma.user.create({
        data: {
          email: customerEmail,
          passwordHash,
          name: "Marcus Vance",
          role: Role.CUSTOMER,
          companyName: "RaceCraft Events Ltd",
        },
      });
    }

    // 4. Seed Initial Sample Orders if empty
    const orderCount = await prisma.order.count();
    if (orderCount === 0 && customer) {
      const raceDivision = await prisma.productDivision.findFirst({
        where: { slug: DivisionSlug.RACE_EVENT_NUMBERS },
      });
      const stickerDivision = await prisma.productDivision.findFirst({
        where: { slug: DivisionSlug.LABELS_STICKERS },
      });

      if (raceDivision) {
        const order1 = await prisma.order.create({
          data: {
            orderNumber: "DH-2026-1001",
            customerId: customer.id,
            divisionId: raceDivision.id,
            status: PipelineStatus.PRODUCTION,
            widthMm: 210,
            heightMm: 148,
            material: "Tyvek 75gsm (Waterproof)",
            orientation: "LANDSCAPE",
            quantity: 250,
            unitPrice: 0.54,
            subtotal: 135.0,
            discountPercent: 30.0,
            discountAmount: 45.0,
            taxRate: 0.20,
            taxAmount: 27.0,
            totalPrice: 162.0,
            isApproved: true,
            approvedAt: new Date(),
            hasCsvData: true,
            csvRawData: "Bib,Name,Category\n101,Marcus Vance,Full Marathon\n102,Elena Rostova,Half Marathon",
          },
        });

        // Add Proof Revision v1
        const revision = await prisma.proofRevision.create({
          data: {
            orderId: order1.id,
            version: 1,
            previewImageUrl: "https://placehold.co/800x600/1e293b/10b981?text=Proof+V1+Tyvek+Bib",
            status: ProofStatus.APPROVED,
            reviewedAt: new Date(),
          },
        });

        await prisma.proofLog.create({
          data: {
            revisionId: revision.id,
            userId: customer.id,
            action: "APPROVED",
            notes: "Initial proof approved for bulk production.",
          },
        });

        // Add Production File (Unlocked because approved)
        await prisma.productionFile.create({
          data: {
            orderId: order1.id,
            fileName: "DH-2026-1001_RACE_EVENT_NUMBERS_2026-11-25_Output.pdf",
            fileType: "CSV_VARIABLE_DATA_PDF",
            fileUrl: "/outputs/DH-2026-1001_RACE_EVENT_NUMBERS_2026-11-25_Output.pdf",
            fileSizeKb: 1420.5,
            isUnlocked: true,
          },
        });
      }

      if (stickerDivision) {
        const order2 = await prisma.order.create({
          data: {
            orderNumber: "DH-2026-1002",
            customerId: customer.id,
            divisionId: stickerDivision.id,
            status: PipelineStatus.PROOF,
            widthMm: 75,
            heightMm: 75,
            material: "Gloss Vinyl",
            orientation: "PORTRAIT",
            quantity: 500,
            unitPrice: 0.18,
            subtotal: 90.0,
            discountPercent: 40.0,
            discountAmount: 36.0,
            taxRate: 0.20,
            taxAmount: 18.0,
            totalPrice: 108.0,
            isApproved: false,
          },
        });

        await prisma.proofRevision.create({
          data: {
            orderId: order2.id,
            version: 1,
            previewImageUrl: "https://placehold.co/800x600/1e293b/f59e0b?text=Proof+V1+Stickers",
            status: ProofStatus.PENDING,
          },
        });

        await prisma.productionFile.create({
          data: {
            orderId: order2.id,
            fileName: "DH-2026-1002_LABELS_STICKERS_2026-11-25_Output.pdf",
            fileType: "PRINT_READY_PDF",
            fileUrl: "/outputs/DH-2026-1002_LABELS_STICKERS_2026-11-25_Output.pdf",
            fileSizeKb: 890.0,
            isUnlocked: false, // Gated until approved
          },
        });
      }
    }
    // eslint-disable-next-line no-console
    console.log("✅ Database bootstrap completed: Admin, Customer & Divisions ready.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ Bootstrap warning:", err);
  }
}
