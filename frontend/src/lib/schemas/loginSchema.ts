import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: "Email is required" })
    .pipe(z.email({ error: "Please enter a valid email address" })),
  password: z.string().min(6, { error: "Password is required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
