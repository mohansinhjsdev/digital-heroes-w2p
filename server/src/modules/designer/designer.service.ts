import { prisma } from "../../prisma";
import { AppError } from "../../utils/app-error";
import { SaveDesignInput } from "./designer.schema";
import { productsService } from "../products/products.service";

export class DesignerService {
  async saveDesign(customerId: string, data: SaveDesignInput) {
    // Resolve division
    let division = await prisma.productDivision.findFirst({
      where: {
        OR: [
          { id: data.divisionId },
          { slug: data.divisionId.toUpperCase() as any }
        ]
      }
    });

    if (!division) {
      const fallback = await productsService.getDivisionBySlug(data.divisionId);
      // Ensure it exists in DB if possible
      try {
        division = await prisma.productDivision.upsert({
          where: { slug: fallback.slug },
          update: {},
          create: {
            slug: fallback.slug,
            name: fallback.name,
            tagline: fallback.tagline,
            description: fallback.description,
            basePrice: fallback.basePrice,
            pricePerSqMm: fallback.pricePerSqMm,
            defaultWidthMm: fallback.defaultWidthMm,
            defaultHeightMm: fallback.defaultHeightMm,
            allowedMaterials: fallback.allowedMaterials,
            galleryImages: fallback.galleryImages,
          }
        });
      } catch {
        // use fallback id
      }
    }

    const divisionId = division?.id || data.divisionId;

    const saved = await prisma.savedDesign.create({
      data: {
        customerId,
        divisionId,
        name: data.name,
        widthMm: data.widthMm,
        heightMm: data.heightMm,
        canvasJson: data.canvasJson,
        previewUrl: data.previewUrl,
      },
      include: {
        division: true,
      }
    });

    return saved;
  }

  async getCustomerDesigns(customerId: string) {
    return prisma.savedDesign.findMany({
      where: { customerId },
      include: { division: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getDesignById(id: string, customerId: string) {
    const design = await prisma.savedDesign.findFirst({
      where: { id, customerId },
      include: { division: true },
    });
    if (!design) {
      throw new AppError(404, "Saved design not found.");
    }
    return design;
  }

  async deleteDesign(id: string, customerId: string) {
    const design = await prisma.savedDesign.findFirst({
      where: { id, customerId },
    });
    if (!design) {
      throw new AppError(404, "Design not found or unauthorized.");
    }
    await prisma.savedDesign.delete({ where: { id } });
    return { id };
  }
}

export const designerService = new DesignerService();
