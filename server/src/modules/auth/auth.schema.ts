import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
