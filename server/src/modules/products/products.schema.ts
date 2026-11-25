import { z } from "zod";
import { DivisionSlug } from "@prisma/client";

export const getDivisionBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
});

export const updateDivisionSchema = z.object({
  params: z.object({
    id: z.string().uuid("Valid division ID required"),
  }),
  body: z.object({
    name: z.string().optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    pricePerSqMm: z.number().positive().optional(),
    minQuantity: z.number().int().positive().optional(),
    defaultWidthMm: z.number().positive().optional(),
    defaultHeightMm: z.number().positive().optional(),
    bleedMm: z.number().nonnegative().optional(),
    safeZoneMm: z.number().nonnegative().optional(),
    supportsCsvMerge: z.boolean().optional(),
    allowedMaterials: z.array(z.string()).optional(),
  }),
});

export type GetDivisionBySlugParams = z.infer<typeof getDivisionBySlugSchema>["params"];
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>["body"];
