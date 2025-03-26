import { DataModel, Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    userType: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    // Additional fields based on user type
    profileImage: v.optional(v.id("_storage")),
    languages: v.optional(v.array(v.string())),
    phone: v.optional(v.string()),
    cin: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    cinFrontImage: v.optional(v.id("_storage")),
    cinBackImage: v.optional(v.id("_storage")),
    driverLicenseImage: v.optional(v.id("_storage")),
    tourismLicenseImage: v.optional(v.id("_storage")),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    // Build user object with optional fields
    const userData = {
      userType: args.userType,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      languages: args.languages || [],
      rating: args.userType === "partner" ? 0 : undefined,
      isVerified: args.userType === "partner" ? false : true,
      verificationStatus: args.userType === "partner" ? "pending" : undefined,
      profileImage: args.profileImage,
      // Add additional fields if present
      ...(args.cin && { cin: args.cin }),
      ...(args.address && { address: args.address }),
      ...(args.city && { city: args.city }),
      ...(args.cinFrontImage && {
        cinFrontImage: args.cinFrontImage,
      }),
      ...(args.cinBackImage && {
        cinBackImage: args.cinBackImage,
      }),
      ...(args.driverLicenseImage && {
        driverLicenseImage: args.driverLicenseImage,
      }),
      ...(args.tourismLicenseImage && {
        tourismLicenseImage: args.tourismLicenseImage,
      }),
    } as Doc<"users">;

    return await ctx.db.insert("users", userData);
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    cin: v.optional(v.string()),
    cinFrontImage: v.optional(v.id("_storage")),
    cinBackImage: v.optional(v.id("_storage")),
    driverLicenseImage: v.optional(v.id("_storage")),
    tourismLicenseImage: v.optional(v.id("_storage")),
    postalCode: v.optional(v.string()),
    rating: v.optional(v.number()),
    profileImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Filter out undefined values
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    return await ctx.db.patch(userId, validUpdates);
  },
});

// Get all partners (for admin purposes)
export const listPartners = query({
  args: {
    limit: v.optional(v.number()),
    verificationStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let partnersQuery = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userType"), "partner"));
    if (args.verificationStatus) {
      partnersQuery = partnersQuery.filter((q) =>
        q.eq(q.field("verificationStatus"), args.verificationStatus)
      );
    }

    if (args.limit) {
      (partnersQuery as any) = partnersQuery.take(args.limit);
    }

    return await partnersQuery.collect();
  },
});

// Update partner verification status (admin function)
export const updateVerificationStatus = mutation({
  args: {
    partnerId: v.id("users"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);

    if (!partner || partner.userType !== "partner") {
      throw new Error("Partner not found");
    }

    return await ctx.db.patch(args.partnerId, {
      verificationStatus: args.status,
      isVerified: args.status === "approved",
    });
  },
});

// Update partner profile with registration data
export const updatePartnerProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    cin: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    cinFrontImage: v.optional(v.id("_storage")),
    cinBackImage: v.optional(v.id("_storage")),
    driverLicenseImage: v.optional(v.id("_storage")),
    tourismLicenseImage: v.optional(v.id("_storage")),
    languages: v.optional(v.array(v.string())),
    isVerified: v.optional(v.boolean()),
    verificationStatus: v.optional(v.string()),
    rating: v.optional(v.number()),
    userType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.userType !== "partner") {
      throw new Error("User is not a partner");
    }

    // Filter out undefined values
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    // Update the partner profile with registration data
    // Also set verification status to pending
    return await ctx.db.patch(userId, {
      ...validUpdates,
      verificationStatus: "pending",
      isVerified: false,
    });
  },
});
