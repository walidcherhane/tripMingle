import { router } from "expo-router";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * User profile interface with essential properties for auth routing
 */
export interface UserProfile {
  _id: string;
  userType?: "client" | "partner";
  verificationStatus?: "pending" | "approved" | "rejected";
}

/**
 * Routes a user based on their authentication status and profile
 * @param user Current user data or null/undefined
 * @param currentPath Optional current path for context
 */
export function routeUserByAuth(
  user: UserProfile | null | undefined,
  currentPath?: string
): void {
  // Skip if user data is still loading (undefined)
  if (user === undefined) {
    return;
  }

  // If no authenticated user, redirect to login
  if (user === null) {
    // Only redirect if not already on a login page
    if (currentPath && !isAuthPage(currentPath)) {
      router.replace("/(auth)/login");
    }
    return;
  }

  // Check if user is already on an appropriate page for their status
  if (currentPath && isPageAppropriate(user, currentPath)) {
    // User is already on the correct page, no need to redirect
    console.log("User is on appropriate page:", currentPath);
    return;
  }

  // Route based on user type
  if (user.userType === "partner") {
    routePartnerUser(user, currentPath);
  } else if (user.userType === "client") {
    // Only redirect if not already on a client page
    if (!currentPath?.includes("/client")) {
      router.replace("/(main)/client/(tabs)");
    }
  } else {
    // Unknown user type, send to account type selection
    if (!currentPath?.includes("/account-type")) {
      router.replace("/(auth)/account-type");
    }
  }
}

/**
 * Routes specifically for partner users based on their verification status
 * @param user Partner user data
 * @param currentPath Current path for context
 */
function routePartnerUser(user: UserProfile, currentPath?: string): void {
  console.log("🚀 ~ routePartnerUser ~ currentPath:", currentPath);
  console.log(
    "🚀 ~ routePartnerUser ~ verificationStatus:",
    user.verificationStatus
  );

  // If verification status not set, redirect to registration
  if (!user.verificationStatus) {
    // Only redirect if not already on registration page
    if (!currentPath?.includes("/registration")) {
      console.log("Redirecting to partner registration");
      router.replace("/(main)/partner/registration");
    }
    return;
  }

  // Handle redirection based on verification status
  switch (user.verificationStatus) {
    case "pending":
    case "rejected":
      // Only redirect if not already on verification status page
      if (!currentPath?.includes("/verification-status")) {
        console.log("Redirecting to partner verification status");
        router.replace("/(main)/partner/verification-status");
      }
      break;
    case "approved":
      // For approved partners, check if they're already in the partner area
      if (currentPath && isPartnerPath(currentPath)) {
        console.log("Already in partner area, no redirect needed");
        return;
      }

      // Redirect to partner dashboard (index)
      console.log("Redirecting to partner dashboard");
      router.replace("/(main)/partner/(tabs)");
      break;
    default:
      // Fallback for unexpected status values
      if (!currentPath?.includes("/registration")) {
        console.log("Redirecting to partner registration");
        router.replace("/(main)/partner/registration");
      }
  }
}

/**
 * Determines if a path is within the partner area
 * Accounts for Expo Router's convention where parentheses folders are not in the path
 */
function isPartnerPath(path: string): boolean {
  // In Expo Router, a path like /(main)/partner/(tabs)/profile.tsx becomes /partner/profile
  // So we check if the path starts with /partner
  return path.startsWith("/partner");
}

/**
 * Determines if the user should be allowed on the current page
 * Returns true if the page is appropriate for their auth status
 */
export function isPageAppropriate(
  user: UserProfile | null | undefined,
  currentPath: string
): boolean {
  // Authentication pages always allowed when no user
  if (user === null && isAuthPage(currentPath)) {
    return true;
  }

  // Registration page is appropriate for partners with no verification status
  if (
    user?.userType === "partner" &&
    !user.verificationStatus &&
    currentPath.includes("/registration")
  ) {
    return true;
  }

  // Verification status page is appropriate for pending/rejected partners
  if (
    user?.userType === "partner" &&
    (user.verificationStatus === "pending" ||
      user.verificationStatus === "rejected") &&
    currentPath.includes("/verification-status")
  ) {
    return true;
  }

  // Any path in the partner area is appropriate for approved partners
  if (
    user?.userType === "partner" &&
    user.verificationStatus === "approved" &&
    isPartnerPath(currentPath)
  ) {
    return true;
  }

  // Client pages are appropriate for clients
  if (
    user?.userType === "client" &&
    currentPath.includes("/client") &&
    !currentPath.includes("")
  ) {
    return true;
  }

  return false;
}

/**
 * Helper to check if a path is an authentication-related page
 */
function isAuthPage(path: string): boolean {
  return (
    path.includes("/login") ||
    path.includes("/register") ||
    path.includes("/account-type") ||
    path.includes("/onboarding") ||
    path.includes("/reset-password")
  );
}
