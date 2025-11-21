import z from "zod";

export const userRegistrationSchema = z.object({
  name: z.string("Name is required").max(100, "Name is too long"),
  email: z.email("Email is required"),
  password: z
    .string("Password is required")
    .min(8, "Minimumm length should be 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one Number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export const userLoginSchema = z.object({
  email: z.email("Email is required"),
  password: z
    .string("Password is required")
    .min(8, "Minimumm length should be 8 characters"),
});

export const resendVerificationCodeSchema = z.object({
  email: z.email("Email is required"),
  password: z
    .string("Password is required")
    .min(8, "Minimumm length should be 8 characters"),
});

export type UserRegisterInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ResendVerificationCodeInput = z.infer<
  typeof resendVerificationCodeSchema
>;
