import { z } from "zod";

export const saveDesignSchema = z.object({
  body: z.object({
    divisionId: z.string().min(1, "Division ID or slug is required"),
    name: z.string().min(1, "Design name is required"),
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    canvasJson: z.string().min(2, "Canvas JSON state is required"),
    previewUrl: z.string().optional(),
  }),
});

export const getDesignByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Design ID is required"),
  }),
});

export type SaveDesignInput = z.infer<typeof saveDesignSchema>["body"];
