import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  LoginForm,
  passwordResetRequestSchema,
  PasswordResetRequestForm,
  otpVerificationSchema,
  OtpVerificationForm,
  newPasswordSchema,
  NewPasswordForm,
} from "@/lib/schemas/auth";

// Hook for Login Form
export const useLoginForm = (
  defaultValues?: Partial<LoginForm>
): UseFormReturn<LoginForm> => {
  return useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for Password Reset Request Form
export const usePasswordResetRequestForm = (
  defaultValues?: Partial<PasswordResetRequestForm>
): UseFormReturn<PasswordResetRequestForm> => {
  return useForm<PasswordResetRequestForm>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for OTP Verification Form
export const useOtpVerificationForm = (
  defaultValues?: Partial<OtpVerificationForm>
): UseFormReturn<OtpVerificationForm> => {
  return useForm<OtpVerificationForm>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for New Password Form
export const useNewPasswordForm = (
  defaultValues?: Partial<NewPasswordForm>
): UseFormReturn<NewPasswordForm> => {
  return useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      ...defaultValues,
    },
    mode: "onChange",
  });
};
