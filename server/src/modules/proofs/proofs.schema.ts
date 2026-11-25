import { z } from "zod";

export const createRevisionSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Valid order ID is required"),
  }),
  body: z.object({
    previewImageUrl: z.string().min(1, "Preview image URL is required"),
    pdfPreviewUrl: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const requestChangesSchema = z.object({
  params: z.object({
    revisionId: z.string().uuid("Valid revision ID is required"),
  }),
  body: z.object({
    changeRequestNote: z.string().min(3, "Please detail the requested changes"),
  }),
});

export const approveProofSchema = z.object({
  params: z.object({
    revisionId: z.string().uuid("Valid revision ID is required"),
  }),
});

export type CreateRevisionInput = z.infer<typeof createRevisionSchema>["body"];
export type RequestChangesInput = z.infer<typeof requestChangesSchema>["body"];
