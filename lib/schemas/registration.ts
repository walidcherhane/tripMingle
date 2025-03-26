// app/lib/schemas/registration.ts
import { z } from "zod";
import { Id } from "@/convex/_generated/dataModel";

// Regular expressions for validation
const PHONE_REGEX = /^(?:\+212|0)([567]\d{8})$/;
const CIN_REGEX = /^[A-Z]{1,3}\d{6}\d{2}$/;
const LICENSE_PLATE_REGEX = /^\d{1,5}\s\|\s[\u0621-\u064A]\s\|\s\d{1,2}$/;

// Custom schema for Convex storage IDs
const storageIdSchema = z.custom<Id<"_storage">>();

// Personal Information Schema (for partners)
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(PHONE_REGEX, "Invalid Moroccan phone number"),
  cin: z.string().regex(CIN_REGEX, "Invalid CIN format"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(5, "Valid postal code required"),
  profileImage: storageIdSchema.nullable(),
  cinFrontImage: storageIdSchema.nullable(),
  cinBackImage: storageIdSchema.nullable(),
  driverLicenseImage: storageIdSchema.nullable(),
});

// Client Information Schema (simplified for clients)
export const clientInfoSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirmation: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    profileImage: storageIdSchema.nullable(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

// Vehicle Information Schema
export const vehicleInfoSchema = z.object({
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(2, "Model is required"),
  year: z.string().refine(
    (val) => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1990 && year <= currentYear;
    },
    { message: "Invalid year" }
  ),
  color: z.optional(z.string()),
  pricePerKm: z.string(),
  category: z.optional(z.enum(["standard", "premium", "luxury", "van"])),
  features: z.optional(z.array(z.string())), // ["AC", "WiFi", etc.]
  capacity: z.string().refine(
    (val) => {
      const capacity = parseInt(val);
      return capacity > 0 && capacity <= 50;
    },
    { message: "Invalid capacity" }
  ),
  licensePlate: z
    .string()
    .regex(LICENSE_PLATE_REGEX, "Invalid license plate format"),
  vehicleImages: z
    .array(storageIdSchema)
    .min(1, "At least one vehicle image is required"),
  carteGriseImage: storageIdSchema.nullable(),
  insuranceImage: storageIdSchema.nullable(),
  technicalInspectionImage: storageIdSchema.nullable(),
});

// Authorization Information Schema
export const authorizationSchema = z.object({
  tourismLicenseImage: storageIdSchema.nullable(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

// Combined Registration Schema (for partners)
export const registrationSchema = z.object({
  personalInfo: personalInfoSchema,
  vehicleInfo: vehicleInfoSchema,
  authorizationInfo: authorizationSchema,
});

export const clientRegistrationSchema = z.object({
  clientInfo: clientInfoSchema,
});

// Type Definitions
export type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
export type ClientInfoForm = z.infer<typeof clientInfoSchema>;
export type VehicleInfoForm = z.infer<typeof vehicleInfoSchema>;
export type AuthorizationForm = z.infer<typeof authorizationSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema> &
  z.infer<typeof clientRegistrationSchema>;
