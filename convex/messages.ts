import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a new message
export const sendMessage = mutation({
  args: {
    tripId: v.id("trips"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    const sender = await ctx.db.get(args.senderId);
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Check if sender is part of this trip
    if (sender.userType === "client" && trip.clientId !== args.senderId) {
      throw new Error("Unauthorized: not your trip");
    }

    if (sender.userType === "partner" && trip.partnerId !== args.senderId) {
      throw new Error("Unauthorized: not your trip");
    }

    return await ctx.db.insert("messages", {
      tripId: args.tripId,
      senderId: args.senderId,
      content: args.content,
      timestamp: Date.now(),
      read: false,
    });

    // In a real application, you'd also want to:
    // 1. Create a notification for the recipient
    // 2. Handle offline messaging
  },
});

// Get all messages for a trip
export const getTripMessages = query({
  args: {
    tripId: v.id("trips"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let messagesQuery = ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .order("asc") as any;

    if (args.limit) {
      messagesQuery = messagesQuery.take(args.limit);
    }

    return await messagesQuery.collect();
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    tripId: v.id("trips"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Get all unread messages sent to this user
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("tripId"), args.tripId),
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    // Mark each message as read
    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        read: true,
      });
    }

    return unreadMessages.length;
  },
});

// Count unread messages for a user
export const countUnreadMessages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Find all trips this user is part of
    const clientTrips = await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("clientId"), args.userId))
      .collect();

    const partnerTrips = await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("partnerId"), args.userId))
      .collect();

    const allTrips = [...clientTrips, ...partnerTrips];
    const tripIds = allTrips.map((trip) => trip._id);

    // If no trips, return 0
    if (tripIds.length === 0) {
      return 0;
    }

    // Count unread messages across all trips
    let totalUnread = 0;

    for (const tripId of tripIds) {
      const unreadCount = await ctx.db
        .query("messages")
        .filter((q) =>
          q.and(
            q.eq(q.field("tripId"), tripId),
            q.neq(q.field("senderId"), args.userId),
            q.eq(q.field("read"), false)
          )
        )
        .collect();

      totalUnread += unreadCount.length;
    }

    return totalUnread;
  },
});
