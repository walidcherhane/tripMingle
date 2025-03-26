import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  personalInfoSchema,
  vehicleInfoSchema,
  authorizationSchema,
  clientInfoSchema,
  PersonalInfoForm,
  VehicleInfoForm,
  AuthorizationForm,
  ClientInfoForm,
} from "@/lib/schemas/registration";

// Hook for Personal Information Form
export const usePersonalInfoForm = (
  defaultValues?: Partial<PersonalInfoForm>
): UseFormReturn<PersonalInfoForm> => {
  return useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cin: "",
      address: "",
      city: "",
      postalCode: "",
      profileImage: null,
      cinFrontImage: null,
      cinBackImage: null,
      driverLicenseImage: null,
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for Client Information Form
export const useClientInfoForm = (
  defaultValues?: Partial<ClientInfoForm>
): UseFormReturn<ClientInfoForm> => {
  return useForm<ClientInfoForm>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profileImage: null,
      termsAccepted: false,
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for Vehicle Information Form
export const useVehicleInfoForm = (
  defaultValues?: Partial<VehicleInfoForm>
): UseFormReturn<VehicleInfoForm> => {
  return useForm<VehicleInfoForm>({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: "",
      pricePerKm: "",
      capacity: "",
      licensePlate: "",
      vehicleImages: [],
      carteGriseImage: null,
      insuranceImage: null,
      technicalInspectionImage: null,
      ...defaultValues,
    },
    mode: "onChange",
  });
};

// Hook for Authorization Information Form
export const useAuthorizationForm = (
  defaultValues?: Partial<AuthorizationForm>
): UseFormReturn<AuthorizationForm> => {
  return useForm<AuthorizationForm>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      tourismLicenseImage: null,
      termsAccepted: false,
      privacyAccepted: false,
      ...defaultValues,
    },
    mode: "onChange",
  });
};
