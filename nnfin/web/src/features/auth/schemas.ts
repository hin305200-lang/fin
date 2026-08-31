import { z } from "zod";

const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, "E-Mail oder Passwort ist falsch."),
  password: z.string().min(1, "E-Mail oder Passwort ist falsch."),
});

export const signupFormSchema = z
  .object({
    name: z.string().trim().min(1, "Bitte geben Sie Ihren Namen ein."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((value) => emailShape.test(value), "Bitte geben Sie eine gültige E-Mail-Adresse ein."),
    phone: z.string().trim(),
    password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen haben."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirm"],
  });

export const publicUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    tax_id: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    kyc: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
  })
  .passthrough();

export const userLoginSchema = z.object({
  kind: z.literal("staff").optional(),
  token: z.string().min(1),
  sessionId: z.string().optional(),
  user: publicUserSchema.optional(),
  admin: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});

export const signupResponseSchema = z.object({
  token: z.string().min(1),
  sessionId: z.string().optional(),
  user: publicUserSchema,
});

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
