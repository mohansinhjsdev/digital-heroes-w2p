import { productsService } from "../products/products.service";
import { CalculatePriceInput } from "./pricing.schema";

export interface PricingBreakdown {
  divisionName: string;
  divisionSlug: string;
  widthMm: number;
  heightMm: number;
  areaSqMm: number;
  quantity: number;
  material: string;
  orientation: string;

  basePriceSetup: number;
  materialMultiplier: number;
  rawUnitPrice: number;
  discountPercent: number;
  discountSavedTotal: number;
  unitPrice: number;

  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;

  xeroAccountingRecord: {
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode: string;
    taxType: string;
    taxAmount: number;
    lineAmount: number;
  };
}

export class PricingService {
  private getMaterialMultiplier(material: string): number {
    const mat = material.toLowerCase();
    if (mat.includes("foil") || mat.includes("crystal") || mat.includes("walnut")) return 1.45;
    if (mat.includes("acrylic") || mat.includes("aluminum") || mat.includes("polypropylene")) return 1.25;
    if (mat.includes("vinyl") || mat.includes("tyvek") || mat.includes("synthetic")) return 1.10;
    return 1.0;
  }

  private getVolumeDiscountPercent(quantity: number): number {
    if (quantity >= 1000) return 50;
    if (quantity >= 500) return 40;
    if (quantity >= 250) return 30;
    if (quantity >= 100) return 20;
    if (quantity >= 50) return 10;
    return 0;
  }

  async calculatePrice(input: CalculatePriceInput): Promise<PricingBreakdown> {
    const division = await productsService.getDivisionBySlug(input.divisionSlug);

    const widthMm = Number(input.widthMm);
    const heightMm = Number(input.heightMm);
    const quantity = Math.max(Number(input.quantity), division.minQuantity);
    const areaSqMm = widthMm * heightMm;

    const materialMultiplier = this.getMaterialMultiplier(input.material);
    const areaCostPerUnit = areaSqMm * division.pricePerSqMm * materialMultiplier;
    const amortizedSetupPerUnit = division.basePrice / quantity;

    // Raw unit price before bulk scale
    const rawUnitPrice = Math.max(0.15, Number((areaCostPerUnit + amortizedSetupPerUnit).toFixed(2)));

    // Volume discount
    const discountPercent = this.getVolumeDiscountPercent(quantity);
    const unitPrice = Number((rawUnitPrice * (1 - discountPercent / 100)).toFixed(2));

    const subtotal = Number((unitPrice * quantity).toFixed(2));
    const rawTotal = Number((rawUnitPrice * quantity).toFixed(2));
    const discountSavedTotal = Number(Math.max(0, rawTotal - subtotal).toFixed(2));

    const taxRate = 0.20; // 20% standard VAT
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const totalPrice = Number((subtotal + taxAmount).toFixed(2));

    const xeroAccountingRecord = {
      description: `${division.name} - ${widthMm}x${heightMm}mm (${input.material})`,
      quantity,
      unitAmount: unitPrice,
      accountCode: "200", // Sales Revenue
      taxType: "OUTPUT2", // 20% VAT on Income
      taxAmount,
      lineAmount: totalPrice,
    };

    return {
      divisionName: division.name,
      divisionSlug: division.slug,
      widthMm,
      heightMm,
      areaSqMm,
      quantity,
      material: input.material,
      orientation: input.orientation || "PORTRAIT",
      basePriceSetup: division.basePrice,
      materialMultiplier,
      rawUnitPrice,
      discountPercent,
      discountSavedTotal,
      unitPrice,
      subtotal,
      taxRate,
      taxAmount,
      totalPrice,
      xeroAccountingRecord,
    };
  }
}

export const pricingService = new PricingService();
