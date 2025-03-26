import { QueryInitializer } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Create a new notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("trip"),
      v.literal("message"),
      v.literal("payment"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      relatedId: args.relatedId,
      timestamp: Date.now(),
      read: false,
    });

    // In a real application, you'd also want to:
    // 1. Send a push notification via a service like Firebase Cloud Messaging
    // 2. Handle email notifications for important updates
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc");

    if (!args.includeRead) {
      notificationsQuery = notificationsQuery.filter((q) =>
        q.eq(q.field("read"), false)
      );
    }

    if (args.limit) {
      (notificationsQuery as any) = notificationsQuery.take(args.limit);
    }

    return await notificationsQuery.collect();
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    return await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }

    return notifications.length;
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    return await ctx.db.delete(args.notificationId);
  },
});

// Count unread notifications
export const countUnreadNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect()
      .then((d) => d.length);
  },
});
