// types/booking.ts

import { Id } from "@/convex/_generated/dataModel";

// Location type for pickup and dropoff
export interface LocationData {
  address: string;
  placeName?: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  city?: string;
  additionalInfo?: string; // gate number, building name, etc.
}

// Vehicle categories and types
export type VehicleCategory = "standard" | "premium" | "luxury" | "van";

export interface VehicleOption {
  id: Id<"vehicles">;
  category: VehicleCategory;
  name: string;
  description?: string;
  capacity: number;
  imageUri: string;
  pricePerKm: number;
  baseFare: number;
  availableCount?: number;
  estimatedWaitTime?: number; // in minutes
}

// Driver profile for matching
export interface DriverProfile {
  id: Id<"users">;
  firstName: string;
  lastName: string;
  profileImage?: string;
  rating: number;
  totalTrips?: number; // Make this optional since we'll calculate it from trips table
  languages: string[];
  vehicle: {
    brand: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
    imageUri: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  eta?: number; // estimated time of arrival in minutes
}

// Trip timing options
export interface TripTiming {
  isScheduled: boolean;
  departureDate?: Date;
  departureTime?: Date;
  // For immediate trips, these will be calculated
  estimatedPickupTime?: Date;
  estimatedDropoffTime?: Date;
  estimatedDuration?: number; // in minutes
}

// Trip details
export interface TripDetails {
  passengers: number;
  luggage: number;
  specialRequests?: string;
  preferredLanguage?: string;
  accessibility?: {
    wheelchairAccessible?: boolean;
    assistanceRequired?: boolean;
    otherNeeds?: string;
  };
}

// Payment methods
export type PaymentMethodType = "card" | "cash" | "mobile";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  // For card
  lastFour?: string;
  cardType?: string;
  expiryDate?: string;
  // For mobile payment
  provider?: string;
  phoneNumber?: string;
}

// Price breakdown
export interface PriceBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare?: number;
  waitingFee?: number;
  tip?: number;
  taxes: number;
  total: number;
  currency: string; // e.g., "MAD" for Moroccan Dirham
}

// Trip status enum
export enum TripStatus {
  SEARCHING = "searching",
  DRIVER_MATCHED = "driverMatched",
  DRIVER_APPROACHING = "driverApproaching",
  DRIVER_ARRIVED = "driverArrived",
  IN_PROGRESS = "inProgress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Full booking data structure
export interface BookingData {
  bookingId?: string;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  selectedVehicle?: VehicleOption;
  timing: TripTiming;
  tripDetails: TripDetails;
  driver?: DriverProfile;
  paymentMethod?: PaymentMethod;
  price?: PriceBreakdown;
  status: TripStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Booking step enum for tracking progress
export enum BookingStep {
  LOCATION = "location",
  DETAILS = "details",
  RIDES = "rides",
  CONFIRMATION = "confirmation",
  PAYMENT = "payment",
  ACTIVE = "active",
}

// Route estimate data
export interface RouteEstimate {
  distance: {
    text: string; // formatted value in Km,
    value: number; // distance value in number
  };
  duration: {
    text: string; // formatted value in Min,
    value: number; // distance value in number
  };
}
