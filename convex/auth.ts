import { v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  query,
  mutation,
} from "./_generated/server";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { Id } from "./_generated/dataModel";

// Initialize Convex Auth
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: ResendOTPPasswordReset,
      profile(params, ctx) {
        return {
          email: params.email as string,
          firstName: params.firstName as string,
          lastName: params.lastName as string,
          userType: params.userType as string,
          isVerified: params.userType === "client",
          verificationStatus:
            params.userType === "client" ? "approved" : "pending",
        };
      },
    }),
  ],
});

// check if the user created a passowrd (secret)
export const checkPassword = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", args.email))
      .first();
    return user?.secret !== null;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Get the current authenticated user with registration status
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    // Get the user from the database
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Add the profile image URL if it exists
    const profileImageUrl = user.profileImage
      ? await ctx.storage.getUrl(user.profileImage as Id<"_storage">)
      : null;

    return {
      ...user,
      profileImage: profileImageUrl,
    };
  },
});
