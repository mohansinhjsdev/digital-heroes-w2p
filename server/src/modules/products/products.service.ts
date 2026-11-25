import { prisma } from "../../prisma";
import { DivisionSlug, ProductDivision } from "@prisma/client";
import { AppError } from "../../utils/app-error";
import { UpdateDivisionInput } from "./products.schema";

export const DEFAULT_DIVISIONS: Array<Omit<ProductDivision, "id" | "createdAt" | "updatedAt">> = [
  {
    slug: DivisionSlug.LABELS_STICKERS,
    name: "Labels & Stickers",
    tagline: "Die-cut waterproof decals, product packaging labels & foil finishes.",
    description: "Industrial-grade vinyl and paper labels with custom die-cutting. Precision trimmed with customizable bleed and high durability.",
    basePrice: 15.0,
    pricePerSqMm: 0.00045,
    minQuantity: 50,
    defaultWidthMm: 75,
    defaultHeightMm: 75,
    bleedMm: 2.0,
    safeZoneMm: 2.0,
    supportsCsvMerge: false,
    allowedMaterials: ["Gloss Vinyl", "Matte Polypropylene", "Clear Transparent", "Gold Foil Accent", "Heavyweight Kraft Paper"],
    galleryImages: [
      "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    slug: DivisionSlug.RACE_EVENT_NUMBERS,
    name: "Race & Event Numbers",
    tagline: "Tear-proof waterproof Tyvek bibs for marathons, cycling & triathlons.",
    description: "Lightweight, tear-resistant Tyvek race bibs with high-contrast variable number printing, barcoding, and athlete name personalization via CSV merge.",
    basePrice: 25.0,
    pricePerSqMm: 0.00035,
    minQuantity: 100,
    defaultWidthMm: 210,
    defaultHeightMm: 148,
    bleedMm: 3.0,
    safeZoneMm: 5.0,
    supportsCsvMerge: true,
    allowedMaterials: ["Tyvek 75gsm (Waterproof)", "Synthetic Poly 120gsm", "Recycled Eco Fiber"],
    galleryImages: [
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    slug: DivisionSlug.MTB_BOARDS,
    name: "MTB Boards",
    tagline: "Heavy-duty 800-micron polypropylene handlebar race number plates.",
    description: "Rugged downhill and enduro mountain bike front plates. Pre-punched zip-tie slots, extreme mud and UV resistance.",
    basePrice: 35.0,
    pricePerSqMm: 0.00065,
    minQuantity: 25,
    defaultWidthMm: 190,
    defaultHeightMm: 160,
    bleedMm: 3.0,
    safeZoneMm: 6.0,
    supportsCsvMerge: true,
    allowedMaterials: ["800 Micron Rigid Polypropylene", "1000 Micron Ultra-Tough Matte"],
    galleryImages: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    slug: DivisionSlug.STAMPS,
    name: "Stamps",
    tagline: "Self-inking and traditional wooden hand stamps for corporate branding.",
    description: "Precision laser-engraved rubber stamps delivering crisp 1000 DPI impressions. Available in pocket, desk, and date-stamping models.",
    basePrice: 18.0,
    pricePerSqMm: 0.0012,
    minQuantity: 1,
    defaultWidthMm: 60,
    defaultHeightMm: 40,
    bleedMm: 0.0,
    safeZoneMm: 3.0,
    supportsCsvMerge: false,
    allowedMaterials: ["Self-Inking Trodat Black", "Self-Inking Trodat Blue", "FSC Certified Beechwood Mount"],
    galleryImages: [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    slug: DivisionSlug.TROPHIES,
    name: "Trophies & Awards",
    tagline: "Laser-etched optical crystal, cast acrylic and brushed aluminum podium awards.",
    description: "Custom engraved corporate awards, sports championships, and commemorative plaques with precision UV color printing.",
    basePrice: 45.0,
    pricePerSqMm: 0.0018,
    minQuantity: 1,
    defaultWidthMm: 150,
    defaultHeightMm: 220,
    bleedMm: 0.0,
    safeZoneMm: 10.0,
    supportsCsvMerge: true,
    allowedMaterials: ["Optical K9 Crystal", "15mm Cast Acrylic", "Brushed Silver Aluminum Plaque"],
    galleryImages: [
      "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    slug: DivisionSlug.LASER_CUT,
    name: "Laser-Cut Work",
    tagline: "Architectural acrylic signage, plywood merchandise & custom vector fabrication.",
    description: "High-power CO2 laser cutting and vector engraving for point-of-sale displays, architectural scale models, and custom merchandise.",
    basePrice: 40.0,
    pricePerSqMm: 0.00095,
    minQuantity: 5,
    defaultWidthMm: 300,
    defaultHeightMm: 200,
    bleedMm: 2.0,
    safeZoneMm: 5.0,
    supportsCsvMerge: false,
    allowedMaterials: ["3mm Birch Plywood", "5mm Clear Acrylic", "6mm Solid Walnut", "3mm Matte Black Perspex"],
    galleryImages: [
      "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=600&q=80"
    ]
  }
];

export class ProductsService {
  async getAllDivisions() {
    try {
      const divisions = await prisma.productDivision.findMany({
        orderBy: { slug: "asc" },
      });
      if (divisions.length > 0) {
        return divisions;
      }
    } catch {
      // fallback if DB not yet connected or seeded
    }

    // Return mapped defaults if DB is cold
    return DEFAULT_DIVISIONS.map((d, index) => ({
      ...d,
      id: `default-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getDivisionBySlug(slug: string) {
    try {
      const division = await prisma.productDivision.findFirst({
        where: { slug: slug.toUpperCase() as DivisionSlug },
      });
      if (division) return division;
    } catch {
      // fallback
    }

    const fallback = DEFAULT_DIVISIONS.find(
      (d) =>
        d.slug.toLowerCase() === slug.toLowerCase() ||
        d.slug.toLowerCase().replace(/_/g, "-") === slug.toLowerCase()
    );
    if (!fallback) {
      throw new AppError(404, `Product division '${slug}' not found.`);
    }

    return {
      ...fallback,
      id: `default-${fallback.slug}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async seedDivisionsIfEmpty() {
    try {
      const count = await prisma.productDivision.count();
      if (count === 0) {
        for (const div of DEFAULT_DIVISIONS) {
          await prisma.productDivision.create({ data: div });
        }
      }
    } catch {
      // Ignored if DB is offline during build
    }
  }

  async updateDivision(id: string, data: UpdateDivisionInput) {
    const updated = await prisma.productDivision.update({
      where: { id },
      data,
    });
    return updated;
  }
}

export const productsService = new ProductsService();
