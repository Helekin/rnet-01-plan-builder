import { z } from "zod";

import { requiredString } from "../util/util";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1)
    .pipe(z.email({ error: "Please enter a valid email address" })),
  displayName: requiredString("displayName"),
  password: requiredString("password"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
