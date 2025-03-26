import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Users table (both clients and partners)
  users: defineTable({
    userType: v.union(v.literal("client"), v.literal("partner")), // "client" or "partner"
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    rating: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),

    // Partner-specific fields
    cin: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    verificationStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
  })
    .index("by_email", ["email"])
    .index("by_userType", ["userType"])
    .index("by_verificationStatus", ["verificationStatus"]),

  // Saved Locations table
  savedLocations: defineTable({
    userId: v.id("users"),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("favorite")),
    isFavorite: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_type", ["userId", "type"]),

  // Documents table (for all uploaded documents)
  documents: defineTable({
    ownerId: v.id("users"),
    vehicleId: v.optional(v.id("vehicles")),
    type: v.union(
      v.literal("cin_front"),
      v.literal("cin_back"),
      v.literal("driver_license"),
      v.literal("tourism_license"),
      v.literal("vehicle_registration"),
      v.literal("vehicle_insurance"),
      v.literal("vehicle_technical_inspection"),
      v.literal("other")
    ),
    storageId: v.id("_storage"),
    expiryDate: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("valid"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    isVerified: v.boolean(),
    verifiedAt: v.optional(v.number()),
  }),

  // Vehicles table
  vehicles: defineTable({
    ownerId: v.id("users"),
    brand: v.string(),
    model: v.string(),
    year: v.string(),
    licensePlate: v.string(),
    color: v.string(),
    capacity: v.number(),
    images: v.array(v.id("_storage")),
    pricePerKm: v.number(),
    baseFare: v.number(),
    category: v.union(
      v.literal("standard"),
      v.literal("premium"),
      v.literal("luxury"),
      v.literal("van")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance")
    ),
    features: v.optional(v.array(v.string())), // ["AC", "WiFi", etc.]
    featured: v.optional(v.boolean()), // Whether this vehicle is featured
  }),

  // Trips table
  trips: defineTable({
    clientId: v.id("users"),
    partnerId: v.id("users"),
    vehicleId: v.id("vehicles"),
    status: v.union(
      v.literal("waitingApproval"),
      v.literal("accepted"),
      v.literal("driverOnTheWay"),
      v.literal("arrivedAtPickup"),
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    pickupLocation: v.object({
      address: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      placeName: v.optional(v.string()),
    }),
    dropoffLocation: v.object({
      address: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      placeName: v.optional(v.string()),
    }),
    tripDetails: v.object({
      passengers: v.number(),
      luggage: v.number(),
      specialRequests: v.optional(v.string()),
    }),
    timing: v.object({
      isScheduled: v.boolean(),
      departureDate: v.optional(v.number()),
      arrivalDate: v.optional(v.number()),
    }),
    estimatedDuration: v.optional(v.number()), // in minutes
    estimatedDistance: v.optional(v.number()), // in km
    cancellationReason: v.optional(v.string()),
    pricing: v.optional(
      v.object({
        baseFare: v.number(),
        distanceFare: v.number(),
        taxes: v.number(),
        total: v.number(),
        currency: v.string(),
      })
    ),
    paymentMethod: v.optional(
      v.union(v.literal("card"), v.literal("cash"), v.literal("mobile"))
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Messages table
  messages: defineTable({
    tripId: v.id("trips"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
  }),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("trip"),
      v.literal("message"),
      v.literal("payment"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
    relatedId: v.optional(v.string()), // ID of related trip, message, etc.
  }),

  // Reviews table
  reviews: defineTable({
    tripId: v.id("trips"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
