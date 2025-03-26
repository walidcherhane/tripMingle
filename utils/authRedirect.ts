import { router } from "expo-router";
import { Doc } from "@/convex/_generated/dataModel";

// Define the user profile type
export interface UserProfile {
  _id: string;
  userType?: Doc<"users">["userType"];
  verificationStatus?: Doc<"users">["verificationStatus"];
  [key: string]: any;
}

/**
 * Redirects users based on authentication status and user type
 * @param user The user profile from Convex
 * @param currentPath The current path (optional)
 */
export function handleAuthRedirect(
  user: UserProfile | null | undefined,
  currentPath?: string
): void {
  // Skip if user is undefined (still loading)
  if (user === undefined) {
    return;
  }

  // If no user, go to login
  if (user === null) {
    router.replace("/(auth)/login");
    return;
  }

  // Handle redirection based on user type
  switch (user.userType) {
    case "partner":
      handlePartnerRedirect(user);
      break;
    case "client":
      // For client users, go directly to the client tabs
      router.replace("/(main)/client/(tabs)");
      break;
    default:
      // Unknown user type, go to account type selection
      router.replace("/(auth)/account-type");
  }
}

/**
 * Handles redirection specifically for partner users
 * @param user The partner user profile
 */
function handlePartnerRedirect(user: UserProfile): void {
  // Check verification status
  const verificationStatus = user.verificationStatus;

  // If verification status is not set, user needs to go through registration
  if (!verificationStatus) {
    router.replace("/(main)/partner/registration");
    return;
  }

  // Handle redirection based on verification status
  switch (verificationStatus) {
    case "pending":
    case "rejected":
      // For both pending and rejected, show the verification status page
      router.replace("/(main)/partner/verification-status");
      break;
    case "approved":
      // Approved partners go to dashboard
      router.replace("/(main)/partner/(tabs)");
      break;
    default:
      // Unknown status, go to registration
      router.replace("/(main)/partner/registration");
  }
}
