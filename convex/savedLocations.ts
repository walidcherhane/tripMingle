import { DataModel, Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update a saved location
export const createOrUpdateLocation = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("favorite")),
    locationId: v.optional(v.id("savedLocations")), // Provided when updating
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is a client
    if (user.userType !== "client") {
      throw new Error("Only client users can save locations");
    }

    const now = Date.now();

    // If locationId is provided, update existing location
    if (args.locationId) {
      const location = await ctx.db.get(args.locationId);

      // Verify location exists and belongs to user
      if (!location) {
        throw new Error("Location not found");
      }
      if (location.userId !== args.userId) {
        throw new Error("You don't have permission to update this location");
      }

      // Update the location
      return await ctx.db.patch(args.locationId, {
        name: args.name,
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
        type: args.type,
        updatedAt: now,
      });
    }

    // Check if a location with the same type already exists (if type is home/work)
    if (args.type === "home" || args.type === "work") {
      const existingLocation = await ctx.db
        .query("savedLocations")
        .withIndex("by_userId_and_type", (q) =>
          q.eq("userId", args.userId).eq("type", args.type)
        )
        .first();

      // If found, update the existing home/work location
      if (existingLocation) {
        return await ctx.db.patch(existingLocation._id, {
          name: args.name,
          address: args.address,
          latitude: args.latitude,
          longitude: args.longitude,
          updatedAt: now,
        });
      }
    }

    // Create a new location
    return await ctx.db.insert("savedLocations", {
      userId: args.userId,
      name: args.name,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      type: args.type,
      isFavorite: args.type === "favorite" ? true : false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all saved locations for a user
export const getAllLocations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savedLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get locations by type
export const getLocationsByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("favorite")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savedLocations")
      .withIndex("by_userId_and_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .collect();
  },
});

// Get a specific location
export const getLocation = query({
  args: {
    locationId: v.id("savedLocations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

// Delete a saved location
export const deleteLocation = mutation({
  args: {
    userId: v.id("users"),
    locationId: v.id("savedLocations"),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);

    // Verify location exists and belongs to user
    if (!location) {
      throw new Error("Location not found");
    }
    if (location.userId !== args.userId) {
      throw new Error("You don't have permission to delete this location");
    }

    return await ctx.db.delete(args.locationId);
  },
});

// Check if a name already exists for a user's locations
export const checkNameExists = query({
  args: {
    userId: v.id("users"),
    name: v.string(),
    excludeLocationId: v.optional(v.id("savedLocations")),
  },
  handler: async (ctx, args) => {
    // Query locations with the same name
    const locations = await ctx.db
      .query("savedLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();

    // If excludeLocationId is provided, filter it out
    if (args.excludeLocationId) {
      return locations.some(
        (location) => location._id !== args.excludeLocationId
      );
    }

    return locations.length > 0;
  },
});

// Migration utility to handle legacy saved locations
export const migrateUserLocationsToTable = mutation({
  args: {
    userId: v.id("users"),
    legacyLocations: v.array(
      v.object({
        name: v.string(),
        address: v.string(),
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user is a client
    if (user.userType !== "client") {
      throw new Error("Only client users can have saved locations");
    }

    // Check if already has locations in the new table
    const existingLocations = await ctx.db
      .query("savedLocations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // If already has locations, don't migrate
    if (existingLocations.length > 0) {
      return {
        migrated: 0,
        message: "User already has locations in new table",
      };
    }

    const now = Date.now();
    let migratedCount = 0;

    // Process each location
    for (const location of args.legacyLocations) {
      // Determine type based on name (simple heuristic)
      let locationType = "favorite" as "home" | "work" | "favorite";
      if (location.name.toLowerCase().includes("home")) {
        locationType = "home";
      } else if (
        location.name.toLowerCase().includes("work") ||
        location.name.toLowerCase().includes("office")
      ) {
        locationType = "work";
      }

      // Insert into locations table
      await ctx.db.insert("savedLocations", {
        userId: args.userId,
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        type: locationType,
        isFavorite: locationType === "favorite",
        createdAt: now,
        updatedAt: now,
      });

      migratedCount++;
    }

    return { migrated: migratedCount };
  },
});
