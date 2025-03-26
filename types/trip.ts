// types/trip.ts

// Trip status possibilities
export type TripStatus =
  | "pending" // Waiting for driver acceptance
  | "accepted" // Accepted by driver
  | "arriving" // Driver is on the way to pickup
  | "arrived" // Driver arrived at pickup location
  | "in_progress" // Trip is ongoing
  | "completed" // Trip finished successfully
  | "cancelled"; // Trip was cancelled

// Location details
export interface Location {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  details?: string; // Additional location instructions
}

// Pricing details
export interface TripPricing {
  basePrice: number;
  distance: number;
  duration: number;
  totalAmount: number;
  currency: string;
  breakdown?: {
    base: number;
    distance: number;
    time: number;
    surge?: number;
    tax?: number;
  };
}

// Customer information
export interface TripCustomer {
  id: string;
  name: string;
  phone: string;
  rating: number;
  profileImage?: string;
  previousTrips?: number;
}

// Vehicle information for the trip
export interface TripVehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  color?: string;
  capacity: number;
}

// Payment information
export interface TripPayment {
  status: "pending" | "completed" | "failed";
  method: "cash" | "card" | "mobile_money";
  amount: number;
  currency: string;
  paidAt?: string;
  transactionId?: string;
}

// Trip cancellation details if applicable
export interface TripCancellation {
  cancelledAt: string;
  cancelledBy: "customer" | "driver" | "system";
  reason: string;
  penalty?: number;
}

// Main Trip interface
export interface Trip {
  id: string;
  status: TripStatus;
  pickup: Location;
  dropoff: Location;
  customer: TripCustomer;
  vehicle: TripVehicle;
  pricing: TripPricing;
  payment: TripPayment;

  // Timestamps
  createdAt: string;
  scheduledFor?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;

  // Route information
  estimatedDuration: number; // in minutes
  estimatedDistance: number; // in kilometers
  actualDuration?: number;
  actualDistance?: number;

  // Additional details
  notes?: string;
  cancellation?: TripCancellation;
  rating?: {
    value: number;
    comment?: string;
    givenAt: string;
  };
}

// Trip summary for list views
export interface TripSummary {
  id: string;
  status: TripStatus;
  customer: Pick<TripCustomer, "name" | "rating">;
  pickup: Pick<Location, "name">;
  dropoff: Pick<Location, "name">;
  amount: number;
  currency: string;
  scheduledFor?: string;
  startedAt?: string;
}

// Type for trip updates
export interface TripUpdate {
  id: string;
  status: TripStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

// Type for trip requests
export interface TripRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledFor?: string;
  passengers: number;
  specialRequirements?: string[];
  paymentMethod: TripPayment["method"];
  vehicleCategory?: string;
  vehicleCapacity?: number;
}

// Type for trip response when driver accepts/rejects
export interface TripResponse {
  tripId: string;
  response: "accept" | "reject";
  reason?: string;
  estimatedArrival?: number; // minutes
}
