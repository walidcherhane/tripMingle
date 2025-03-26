import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Register a new vehicle
export const registerVehicle = mutation({
  args: {
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
    features: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if owner exists and is a partner
    const owner = await ctx.db.get(args.ownerId);
    if (!owner || owner.userType !== "partner") {
      throw new Error("Invalid owner ID");
    }

    // Check if vehicle with this license plate already exists
    const existingVehicle = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("licensePlate"), args.licensePlate))
      .first();

    if (existingVehicle) {
      throw new Error("Vehicle with this license plate already exists");
    }

    return await ctx.db.insert("vehicles", {
      status: "inactive", // Start inactive until verified,
      ...args,
    });
  },
});

// Get current user vehicles
export const getUserVehicles = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

// Get vehicle by ID
export const getVehicle = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vehicleId);
  },
});

// Get all vehicles for an owner
export const getOwnerVehicles = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

// Update vehicle information
export const updateVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.string()),
    color: v.optional(v.string()),
    capacity: v.optional(v.number()),
    images: v.optional(v.array(v.id("_storage"))),
    pricePerKm: v.optional(v.number()),
    baseFare: v.optional(v.number()),
    category: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { vehicleId, ...updates } = args;
    const vehicle = await ctx.db.get(vehicleId);

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Filter out undefined values
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    return await ctx.db.patch(vehicleId, validUpdates);
  },
});

// Get vehicle documents
export const getVehicleDocuments = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("vehicleId"), args.vehicleId))
      .collect();
  },
});

// Get featured vehicles (or all active vehicles if none are featured)
export const getFeaturedVehicles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // First try to get featured vehicles
    const featuredVehicles = await ctx.db
      .query("vehicles")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("featured"), true)
        )
      )
      .take(limit);

    // If we have featured vehicles, return them
    if (featuredVehicles.length > 0) {
      return featuredVehicles;
    }

    // Otherwise, return all active vehicles
    return await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(limit);
  },
});

// Toggle featured status of a vehicle
export const toggleFeaturedStatus = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Only active vehicles can be featured
    if (args.featured && vehicle.status !== "active") {
      throw new Error("Only active vehicles can be featured");
    }

    return await ctx.db.patch(args.vehicleId, {
      featured: args.featured,
    });
  },
});
