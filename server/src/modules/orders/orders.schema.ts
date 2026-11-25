import { z } from "zod";
import { PipelineStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  body: z.object({
    divisionSlug: z.string().min(1, "Division slug is required"),
    savedDesignId: z.string().optional(),
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    material: z.string().min(1, "Material is required"),
    orientation: z.enum(["PORTRAIT", "LANDSCAPE"]).optional().default("PORTRAIT"),
    quantity: z.number().int().min(1),
    canvasJson: z.string().optional(),
    uploadedArtwork: z.string().optional(),
    hasCsvData: z.boolean().optional().default(false),
    csvRawData: z.string().optional(),
    csvMappingJson: z.string().optional(),
  }),
});

export const reorderSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Valid order ID is required"),
  }),
  body: z.object({
    quantity: z.number().int().min(1).optional(),
    material: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Valid order ID is required"),
  }),
  body: z.object({
    status: z.nativeEnum(PipelineStatus),
    notes: z.string().optional(),
  }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(PipelineStatus).optional(),
    divisionSlug: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type ReorderInput = z.infer<typeof reorderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];
