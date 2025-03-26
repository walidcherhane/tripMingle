import { z } from "zod";

// Define the form schema using zod
export const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  color: z.string().min(1, "Color is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  pricePerKm: z.coerce.number().min(0, "Price per km must be positive"),
  baseFare: z.coerce.number().min(0, "Base fare must be positive"),
  category: z.enum(["standard", "premium", "luxury", "van"]),
  features: z.array(z.string()).optional(),
  vehicleRegistration: z
    .object({
      storageId: z.string().optional(),
      expiryDate: z.string().optional(),
    })
    .optional(),
  vehicleInsurance: z
    .object({
      storageId: z.string().optional(),
      expiryDate: z.string().optional(),
    })
    .optional(),
  technicalInspection: z
    .object({
      storageId: z.string().optional(),
      expiryDate: z.string().optional(),
    })
    .optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

export const VEHICLE_CATEGORIES = [
  { label: "Standard", value: "standard" },
  { label: "Premium", value: "premium" },
  { label: "Luxury", value: "luxury" },
  { label: "Van", value: "van" },
];

export const VEHICLE_FEATURES = [
  { label: "Air Conditioning", value: "AC" },
  { label: "WiFi", value: "WiFi" },
  { label: "Leather Seats", value: "Leather Seats" },
  { label: "Bluetooth", value: "Bluetooth" },
  { label: "USB Charging", value: "USB Charging" },
  { label: "Child Seat", value: "Child Seat" },
  { label: "Wheelchair Accessible", value: "Wheelchair Accessible" },
];

// Create a separate function to initialize the form with proper defaults
export const getDefaultValues = (): VehicleFormData => {
  return {
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    capacity: 4,
    images: [] as string[],
    pricePerKm: 0,
    baseFare: 0,
    category: "standard" as const,
    features: [] as string[],
    vehicleRegistration: { storageId: undefined, expiryDate: undefined },
    vehicleInsurance: { storageId: undefined, expiryDate: undefined },
    technicalInspection: { storageId: undefined, expiryDate: undefined },
  };
};
