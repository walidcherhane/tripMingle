import { AuthorizationInfo, PersonalInfo, VehicleInfo } from "@/types";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:\+212|0)[567]\d{8}$/;
  return phoneRegex.test(phone);
};

export const validateCIN = (cin: string): boolean => {
  const cinRegex = /^[A-Z]{1,2}\d{6}$/;
  return cinRegex.test(cin);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateYear = (year: string): boolean => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1990 && yearNum <= currentYear;
};

export const validatePersonalInfo = (personalInfo: PersonalInfo) => {
  const errors: Record<string, string> = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:\+212|0)[567]\d{8}$/;
  const cinRegex = /^[A-Z]{1,2}\d{6}$/;

  if (!personalInfo.firstName.trim())
    errors.firstName = "First name is required";
  if (!personalInfo.lastName.trim()) errors.lastName = "Last name is required";
  if (!personalInfo.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(personalInfo.email)) {
    errors.email = "Invalid email format";
  }
  if (!personalInfo.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!phoneRegex.test(personalInfo.phone)) {
    errors.phone = "Invalid Moroccan phone number";
  }
  if (!personalInfo.cin.trim()) {
    errors.cin = "CIN is required";
  } else if (!cinRegex.test(personalInfo.cin)) {
    errors.cin = "Invalid CIN format";
  }
  if (!personalInfo.cinFrontImage)
    errors.cinFrontImage = "CIN front image is required";
  if (!personalInfo.cinBackImage)
    errors.cinBackImage = "CIN back image is required";
  if (!personalInfo.driverLicenseImage)
    errors.driverLicenseImage = "Driver license image is required";

  return errors;
};

export const validateVehicleInfo = (vehicleInfo: VehicleInfo) => {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  if (!vehicleInfo.brand.trim()) errors.brand = "Brand is required";
  if (!vehicleInfo.model.trim()) errors.model = "Model is required";
  if (!vehicleInfo.year.trim()) {
    errors.year = "Year is required";
  } else {
    const yearNum = parseInt(vehicleInfo.year);
    if (yearNum < 1990 || yearNum > currentYear) {
      errors.year = "Invalid year";
    }
  }
  if (!vehicleInfo.capacity.trim()) {
    errors.capacity = "Capacity is required";
  } else if (parseInt(vehicleInfo.capacity) < 1) {
    errors.capacity = "Invalid capacity";
  }
  if (!vehicleInfo.licensePlate.trim())
    errors.licensePlate = "License plate is required";
  if (vehicleInfo.vehicleImages.length === 0)
    errors.vehicleImages = "Vehicle images are required";
  if (!vehicleInfo.carteGriseImage)
    errors.carteGriseImage = "Carte grise is required";
  if (!vehicleInfo.insuranceImage)
    errors.insuranceImage = "Insurance document is required";
  if (!vehicleInfo.technicalInspectionImage)
    errors.technicalInspectionImage = "Technical inspection is required";

  return errors;
};

export const validateAuthorizationInfo = (
  authorizationInfo: AuthorizationInfo
) => {
  const errors: Record<string, string> = {};

  if (!authorizationInfo.tourismLicenseImage)
    errors.tourismLicenseImage = "Tourism license is required";
  if (!authorizationInfo.termsAccepted)
    errors.termsAccepted = "You must accept the terms";
  if (!authorizationInfo.privacyAccepted)
    errors.privacyAccepted = "You must accept the privacy policy";

  return errors;
};
