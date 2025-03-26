import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";

// Count the total number of trips for a user (either client or partner)
export const countUserTrips = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.userType === "client") {
      // Count trips where the user is the client
      const trips = await ctx.db
        .query("trips")
        .filter((q) => q.eq(q.field("clientId"), args.userId))
        .collect();
      return trips.length;
    } else if (user.userType === "partner") {
      // Count trips where the user is the partner/driver
      const trips = await ctx.db
        .query("trips")
        .filter((q) => q.eq(q.field("partnerId"), args.userId))
        .collect();
      return trips.length;
    }

    return 0;
  },
});

// Create a trip request
export const createTripRequest = mutation({
  args: {
    clientId: v.id("users"),
    partnerId: v.id("users"),
    vehicleId: v.id("vehicles"),
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
    estimatedDistance: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    pricing: v.optional(
      v.object({
        baseFare: v.number(),
        distanceFare: v.number(),
        taxes: v.number(),
        total: v.number(),
        currency: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if client exists
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userType !== "client") {
      throw new Error("Invalid client ID");
    }
    // Check if partner exists
    const tripId = await ctx.db.insert("trips", {
      clientId: args.clientId,
      partnerId: args.partnerId,
      vehicleId: args.vehicleId,
      status: "waitingApproval",
      pickupLocation: args.pickupLocation,
      dropoffLocation: args.dropoffLocation,
      tripDetails: args.tripDetails,
      timing: args.timing,
      estimatedDistance: args.estimatedDistance,
      estimatedDuration: args.estimatedDuration,
      pricing: args.pricing,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create notification for trip creation
    await ctx.db.insert("notifications", {
      userId: args.clientId,
      type: "trip",
      title: "Trip Request Created",
      message: args.timing.isScheduled
        ? "Your scheduled trip request has been created and we're finding a driver for you."
        : "Your trip request has been created and we're finding a driver for you.",
      relatedId: tripId,
      timestamp: Date.now(),
      read: false,
    });

    return tripId;
  },
});

// Accept a trip (by partner)
export const acceptTrip = mutation({
  args: {
    tripId: v.id("trips"),
    partnerId: v.id("users"),
    vehicleId: v.id("vehicles"),
    estimatedArrival: v.number(), // ETA in minutes
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    const partner = await ctx.db.get(args.partnerId);
    if (!partner || partner.userType !== "partner") {
      throw new Error("Invalid partner ID");
    }

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.ownerId !== args.partnerId) {
      throw new Error("Invalid vehicle ID");
    }

    // Update trip with partner info
    await ctx.db.patch(args.tripId, {
      partnerId: args.partnerId,
      vehicleId: args.vehicleId,
      status: "accepted",
      updatedAt: Date.now(),
    });

    return args.tripId;
  },
});

// Refuse a trip (by partner)
export const refuseTrip = mutation({
  args: {
    tripId: v.id("trips"),
    partnerId: v.id("users"),
    refusalReason: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    const partner = await ctx.db.get(args.partnerId);
    if (!partner || partner.userType !== "partner") {
      throw new Error("Invalid partner ID");
    }

    // Update trip status to cancelled
    await ctx.db.patch(args.tripId, {
      status: "cancelled",
      cancellationReason: args.refusalReason,
      updatedAt: Date.now(),
    });

    // Create notification for the client
    await ctx.db.insert("notifications", {
      userId: trip.clientId,
      type: "trip",
      title: "Trip Request Refused",
      message: `Your trip request was refused by the driver. Reason: ${args.refusalReason}`,
      relatedId: args.tripId,
      timestamp: Date.now(),
      read: false,
    });

    // Create notification for the partner
    await ctx.db.insert("notifications", {
      userId: args.partnerId,
      type: "trip",
      title: "Trip Request Refused",
      message: `You refused the trip request. Reason: ${args.refusalReason}`,
      relatedId: args.tripId,
      timestamp: Date.now(),
      read: false,
    });

    return args.tripId;
  },
});

// Update trip status
export const updateTripStatus = mutation({
  args: {
    tripId: v.id("trips"),
    status: v.union(
      v.literal("waitingApproval"),
      v.literal("accepted"),
      v.literal("driverOnTheWay"),
      v.literal("arrivedAtPickup"),
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Update the trip status
    await ctx.db.patch(args.tripId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.tripId;
  },
});

// Cancel a trip
export const cancelTrip = mutation({
  args: {
    tripId: v.id("trips"),
    cancellationReason: v.string(),
    cancelledBy: v.string(), // "client" or "partner"
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Check if trip can be cancelled (not already completed)
    if (trip.status === "completed") {
      throw new Error("Cannot cancel a completed trip");
    }

    // Update trip status to cancelled
    await ctx.db.patch(args.tripId, {
      status: "cancelled",
      cancellationReason: args.cancellationReason,
      updatedAt: Date.now(),
    });

    // Get the canceller and the other party
    const isClientCanceller = args.cancelledBy === "client";

    // Create notification for the client
    if (trip.clientId) {
      await ctx.db.insert("notifications", {
        userId: trip.clientId,
        type: "trip",
        title: isClientCanceller
          ? "Trip Cancelled"
          : "Trip Cancelled by Driver",
        message: isClientCanceller
          ? "You have cancelled your trip."
          : `Your trip has been cancelled by the driver. Reason: ${args.cancellationReason}`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    // Create notification for the partner (if exists)
    if (trip.partnerId) {
      await ctx.db.insert("notifications", {
        userId: trip.partnerId,
        type: "trip",
        title: isClientCanceller
          ? "Trip Cancelled by Client"
          : "Trip Cancelled",
        message: isClientCanceller
          ? `The client has cancelled their trip. Reason: ${args.cancellationReason}`
          : "You have cancelled this trip.",
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    return args.tripId;
  },
});

// Get trip by ID
export const getTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

// Get trips for a client
export const getClientTrips = query({
  args: {
    clientId: v.id("users"),
    status: v.union(
      v.literal("searching"),
      v.literal("driverMatched"),
      v.literal("driverApproaching"),
      v.literal("driverArrived"),
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .order("desc");

    if (args.status) {
      tripsQuery = tripsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const limit = args.limit ?? 100; // Default limit if not provided
    return await tripsQuery.take(limit);
  },
});

// Get trips for a partner
export const getPartnerTrips = query({
  args: {
    partnerId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("searching"),
        v.literal("driverMatched"),
        v.literal("driverApproaching"),
        v.literal("driverArrived"),
        v.literal("inProgress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .order("desc");

    if (args.status) {
      tripsQuery = tripsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const limit = args.limit ?? 100; // Default limit if not provided
    return await tripsQuery.take(limit);
  },
});

export const getTripRequests = query({
  args: {
    partnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .filter((q) => q.eq(q.field("status"), "waitingApproval"))
      .collect();
  },
});

export const getUpcomingTrips = query({
  args: {
    partnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return await Promise.all(
      trips.map(async (trip) => {
        const client = await ctx.db.get(trip.clientId);
        const vehicle = await ctx.db.get(trip.vehicleId!);
        return {
          ...trip,
          client,
          vehicle,
        };
      })
    );
  },
});

export const getTotalEarnings = query({
  args: {
    partnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    return trips.reduce((acc, trip) => acc + (trip.pricing?.total || 0), 0);
  },
});

// Set trip pricing
export const setTripPricing = mutation({
  args: {
    tripId: v.id("trips"),
    pricing: v.object({
      baseFare: v.number(),
      distanceFare: v.number(),
      taxes: v.number(),
      total: v.number(),
      currency: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    return await ctx.db.patch(args.tripId, {
      pricing: args.pricing,
      updatedAt: Date.now(),
    });
  },
});

// Set payment method
export const setPaymentMethod = mutation({
  args: {
    tripId: v.id("trips"),
    paymentMethod: v.union(
      v.literal("card"),
      v.literal("cash"),
      v.literal("mobile")
    ),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Update the payment method
    await ctx.db.patch(args.tripId, {
      paymentMethod: args.paymentMethod,
      updatedAt: Date.now(),
    });

    // Create notification for payment method update
    if (trip.clientId) {
      await ctx.db.insert("notifications", {
        userId: trip.clientId,
        type: "payment",
        title: "Payment Method Updated",
        message: `Your payment method has been updated to ${args.paymentMethod}.`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    return args.tripId;
  },
});

// Process payment for a trip
export const processPayment = mutation({
  args: {
    tripId: v.id("trips"),
    amount: v.number(),
    transactionId: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // In a real app, you would integrate with a payment provider here

    // Update trip with payment information
    await ctx.db.patch(args.tripId, {
      pricing: {
        baseFare: args.amount * 0.7, // Example calculation
        distanceFare: args.amount * 0.2, // Example calculation
        taxes: args.amount * 0.1, // Example calculation
        total: args.amount,
        currency: args.currency,
      },
      paymentMethod: "card", // Assuming card payment in this example
      updatedAt: Date.now(),
    });

    // Create notification for successful payment
    if (trip.clientId) {
      await ctx.db.insert("notifications", {
        userId: trip.clientId,
        type: "payment",
        title: "Payment Successful",
        message: `Your payment of ${args.amount.toFixed(2)} ${args.currency} for the trip has been processed successfully.`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    // Create notification for the partner about the payment
    if (trip.partnerId) {
      await ctx.db.insert("notifications", {
        userId: trip.partnerId,
        type: "payment",
        title: "Payment Received",
        message: `Payment of ${args.amount.toFixed(2)} ${args.currency} for the trip has been received.`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    return args.tripId;
  },
});

// Add a rating to a trip
export const addRating = mutation({
  args: {
    tripId: v.id("trips"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Check if trip is completed
    if (trip.status !== "completed") {
      throw new Error("Can only rate completed trips");
    }

    // Add review to the reviews table
    const reviewId = await ctx.db.insert("reviews", {
      tripId: args.tripId,
      reviewerId: args.reviewerId,
      revieweeId: args.revieweeId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Create notification for the reviewee about the rating
    await ctx.db.insert("notifications", {
      userId: args.revieweeId,
      type: "trip",
      title: "New Trip Rating",
      message: `You received a ${args.rating}-star rating for your recent trip.`,
      relatedId: args.tripId,
      timestamp: Date.now(),
      read: false,
    });

    return args.tripId;
  },
});

// Send reminder for scheduled trips
export const sendScheduledTripReminder = mutation({
  args: {
    tripId: v.id("trips"),
    minutesBefore: v.number(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Check if this is a scheduled trip
    if (!trip.timing.isScheduled) {
      throw new Error("Trip is not scheduled");
    }

    // Create notification for trip reminder
    if (trip.clientId) {
      await ctx.db.insert("notifications", {
        userId: trip.clientId,
        type: "trip",
        title: "Upcoming Trip Reminder",
        message: `Your scheduled trip is coming up in ${args.minutesBefore} minutes.`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    // If there's a partner assigned, also notify them
    if (trip.partnerId) {
      await ctx.db.insert("notifications", {
        userId: trip.partnerId,
        type: "trip",
        title: "Upcoming Trip Reminder",
        message: `You have a scheduled trip coming up in ${args.minutesBefore} minutes.`,
        relatedId: args.tripId,
        timestamp: Date.now(),
        read: false,
      });
    }

    return args.tripId;
  },
});

// Get the trip where the partner is the driver
export const getCurrentTrip = query({
  args: {
    partnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .filter((q) =>
        q.not(
          q.or(
            q.eq(q.field("status"), "cancelled"),
            q.eq(q.field("status"), "waitingDriverApproval")
          )
        )
      )
      .first();
  },
});
// Get partner trips within a date range
export const getPartnerTripsByDate = query({
  args: {
    partnerId: v.id("users"),
    status: v.optional(v.string()),
    startDate: v.number(), // Timestamp in milliseconds
    endDate: v.number(), // Timestamp in milliseconds
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      );

    if (args.status) {
      tripsQuery = tripsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    return await tripsQuery.collect();
  },
});

// Get pending trips available for any partner
export const getPendingTrips = query({
  args: {
    limit: v.optional(v.number()),
    partnerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("status"), "searching"));

    // If a partner ID is provided, filter trips assigned to that partner
    if (args.partnerId) {
      tripsQuery = tripsQuery.filter((q) =>
        q.eq(q.field("partnerId"), args.partnerId)
      );
    }

    // Add the order clause
    const orderedQuery = tripsQuery.order("desc");

    const limit = args.limit ?? 10; // Default limit
    return await orderedQuery.take(limit);
  },
});

// Get pending trips filtered by vehicle category and capacity
export const getPendingTripsByVehicle = query({
  args: {
    vehicleCategory: v.string(),
    vehicleCapacity: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q: any) => q.eq(q.field("status"), "searching"))
      .filter((q: any) => q.eq(q.field("partnerId"), undefined)) // Only trips that haven't been assigned yet
      .filter((q: any) =>
        q.or(
          // If no vehicle category specified in trip, or it matches the provided category
          q.eq(q.field("vehicleCategory"), undefined),
          q.eq(q.field("vehicleCategory"), args.vehicleCategory)
        )
      )
      .filter((q: any) =>
        q.or(
          // If no capacity specified in trip, or the provided capacity is sufficient
          q.eq(q.field("vehicleCapacity"), undefined),
          q.lte(q.field("vehicleCapacity"), args.vehicleCapacity)
        )
      )
      .order("desc");

    const limit = args.limit ?? 10; // Default limit
    return await tripsQuery.take(limit);
  },
});
