import { z } from "zod";

export const generatePrintFileSchema = z.object({
  body: z.object({
    orderId: z.string().uuid("Valid order ID is required"),
    designState: z.record(z.any()).optional(),
    csvContent: z.string().optional(),
  }),
});

export const downloadFileSchema = z.object({
  params: z.object({
    fileId: z.string().min(1, "File ID is required"),
  }),
});

export type GeneratePrintFileInput = z.infer<typeof generatePrintFileSchema>["body"];
