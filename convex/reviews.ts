import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a review
export const submitReview = mutation({
  args: {
    tripId: v.id("trips"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate the review
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if trip exists and is completed
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "completed") {
      throw new Error("Can only review completed trips");
    }

    // Check if reviewer is part of the trip
    if (
      trip.clientId !== args.reviewerId &&
      trip.partnerId !== args.reviewerId
    ) {
      throw new Error("You can only review trips you were part of");
    }

    // Check if reviewee is part of the trip
    if (
      trip.clientId !== args.revieweeId &&
      trip.partnerId !== args.revieweeId
    ) {
      throw new Error("Can only review users who were part of the trip");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .filter((q) =>
        q.and(
          q.eq(q.field("tripId"), args.tripId),
          q.eq(q.field("reviewerId"), args.reviewerId)
        )
      )
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this trip");
    }

    // Create the review
    const reviewId = await ctx.db.insert("reviews", {
      tripId: args.tripId,
      reviewerId: args.reviewerId,
      revieweeId: args.revieweeId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update the reviewee's rating
    const reviewee = await ctx.db.get(args.revieweeId);
    if (reviewee) {
      const reviews = await ctx.db
        .query("reviews")
        .filter((q) => q.eq(q.field("revieweeId"), args.revieweeId))
        .collect();

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating = totalRating / reviews.length;

      await ctx.db.patch(args.revieweeId, {
        rating: avgRating,
      });
    }

    return reviewId;
  },
});

// Get reviews for a user
export const getUserReviews = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("revieweeId"), args.userId))
      .order("desc");

    if (args.limit) {
      (reviewsQuery as any) = reviewsQuery.take(args.limit);
    }

    return await reviewsQuery.collect();
  },
});

// Get reviews for a trip
export const getTripReviews = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .collect();
  },
});

// Get review statistics for a user
export const getUserReviewStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("revieweeId"), args.userId))
      .collect();

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  },
});
