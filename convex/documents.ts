import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Upload a document
export const uploadDocument = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if owner exists
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) {
      throw new Error("User not found");
    }

    // Check if a document of this type already exists for this user
    const existingDoc = await ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("ownerId"), args.ownerId),
          q.eq(q.field("type"), args.type)
        )
      )
      .first();

    // If it exists, update it
    if (existingDoc) {
      return await ctx.db.patch(existingDoc._id, {
        storageId: args.storageId,
        expiryDate: args.expiryDate,
        vehicleId: args.vehicleId,
        status: "valid", // Reset status when updated
        isVerified: false, // Needs to be re-verified
      });
    }

    // Otherwise, create a new document
    return await ctx.db.insert("documents", {
      status: "valid",
      isVerified: false,
      ...args,
    });
  },
});

// Get all documents for a user
export const getUserDocuments = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

// Verify a document (admin function)
export const verifyDocument = mutation({
  args: {
    documentId: v.id("documents"),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    return await ctx.db.patch(args.documentId, {
      isVerified: args.isVerified,
      verifiedAt: args.isVerified ? Date.now() : undefined,
    });
  },
});

// Update document status (can be triggered by a scheduled job)
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(v.literal("valid"), v.literal("expired")),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    return await ctx.db.patch(args.documentId, {
      status: args.status,
    });
  },
});
