import { z } from "zod";

// Login Form Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  otp: z.string(),
});

// New Password Schema
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type Definitions
export type LoginForm = z.infer<typeof loginSchema>;
export type PasswordResetRequestForm = z.infer<
  typeof passwordResetRequestSchema
>;
export type OtpVerificationForm = z.infer<typeof otpVerificationSchema>;
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;
