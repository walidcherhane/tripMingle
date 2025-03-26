export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cin: string;
  address: string;
  city: string;
  postalCode: string;
  profileImage: string | null;
  cinFrontImage: string | null;
  cinBackImage: string | null;
  driverLicenseImage: string | null;
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year: string;
  capacity: string;
  licensePlate: string;
  vehicleImages: string[];
  carteGriseImage: string | null;
  insuranceImage: string | null;
  technicalInspectionImage: string | null;
}

export interface AuthorizationInfo {
  tourismLicenseImage: string | null;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface RegistrationData {
  personalInfo: PersonalInfo;
  vehicleInfo: VehicleInfo;
  authorizationInfo: AuthorizationInfo;
}
