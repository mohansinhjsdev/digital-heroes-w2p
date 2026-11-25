import { z } from "zod";
import { DivisionSlug } from "@prisma/client";

export const calculatePriceSchema = z.object({
  body: z.object({
    divisionSlug: z.string().min(1, "Division slug is required"),
    widthMm: z.number().positive("Width must be greater than 0"),
    heightMm: z.number().positive("Height must be greater than 0"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    material: z.string().min(1, "Material must be selected"),
    orientation: z.enum(["PORTRAIT", "LANDSCAPE"]).optional().default("PORTRAIT"),
  }),
});

export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>["body"];
