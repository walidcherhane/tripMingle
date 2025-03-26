import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Doc } from "@/convex/_generated/dataModel";

// Define user profile type
export interface UserProfile {
  _id: string;
  userType?: Doc<"users">["userType"] | undefined;
  verificationStatus?: Doc<"users">["verificationStatus"] | undefined;
  [key: string]: any; // For other properties
}

const routeForState = (user: UserProfile) => {
  if (!user) {
    return "/(auth)/login";
  }
  // Determine the appropriate route based on user type and verification status
  switch (user.userType) {
    case "partner":
      switch (user.verificationStatus) {
        case "pending":
          return "/(partner)/registration-status";
        case "approved":
          return "/(partner)/dashboard";
        case "rejected":
          return "/(partner)/verification-status";
        default:
          return "/(auth)/account-type";
      }

    default:
      return "/(auth)/account-type";
  }
};
/**
 * Simple function to route users based on their authentication and profile status
 * @param user The user profile from the API
 * @param currentPath The current path for context
 */
export function routeUser(
  user: UserProfile | null | undefined,
  currentPath: string
): void {
  console.log("🚀 ~ user:", user);
  if (user === undefined) {
    console.log("User is loading, doing nothing");
    return;
  }

  // Case 1: No authenticated user
  if (user === null) {
    // If not on a login-related page, go to login
    if (!isLoginPage(currentPath)) {
      console.log("No authenticated user, redirecting to login", currentPath);
      router.replace("/(auth)/login");
    }
    return;
  }

  // Case 2: User is authenticated, route based on type and status
  if (user.userType === "client") {
    routeClientUser(user, currentPath);
  } else if (user.userType === "partner") {
    routePartnerUser(user, currentPath);
  } else {
    // Unknown user type, redirect to account type selection
    console.log("Unknown user type, redirecting to account type selection");
    router.replace("/(auth)/account-type");
  }
}

/**
 * Routes a client user based on their registration status
 * @param user The client user profile
 * @param currentPath The current path
 */
function routeClientUser(user: UserProfile, currentPath: string): void {
  // If registration is incomplete and not on registration page, go to registration
  if (
    user.verificationStatus === "pending" &&
    !isClientRegistrationPage(currentPath)
  ) {
    console.log(
      "Client registration incomplete, redirecting to registration",
      currentPath
    );
    router.replace("/(main)/client/registration");
    return;
  }

  // If registration is complete and on registration page, go to dashboard
  if (
    user.verificationStatus === "approved" &&
    isClientRegistrationPage(currentPath)
  ) {
    console.log("Client registration complete, redirecting to dashboard");
    router.replace("/(main)/client/(tabs)");
    return;
  }

  // if we have a active client but in a wrong page, redirect to the correct page
  if (
    user.verificationStatus === "approved" &&
    !isClientRegistrationPage(currentPath)
  ) {
    console.log(
      "Client is active but in a wrong page, redirecting to dashboard"
    );
    router.replace("/(main)/client/(tabs)");
    return;
  }

  // If on login page but already authenticated, go to dashboard
  if (isLoginPage(currentPath)) {
    console.log("Client already authenticated, redirecting to dashboard");
    router.replace("/(main)/client/(tabs)");
    return;
  }
}

/**
 * Routes a partner user based on their registration status
 * @param user The partner user profile
 * @param currentPath The current path
 */
function routePartnerUser(user: UserProfile, currentPath: string): void {
  // First check if user is on login page
  if (isLoginPage(currentPath)) {
    console.log("Partner already authenticated, redirecting to dashboard");
    router.replace("/(main)/partner/(tabs)");
    return;
  }

  // Handle routing based on verification status
  switch (user.verificationStatus) {
    case "pending":
      // If on registration page, stay there
      if (isPartnerRegistrationPage(currentPath)) {
        return;
      }

      // If on verification status page, stay there
      if (isVerificationStatusPage(currentPath)) {
        return;
      }

      // Otherwise, redirect to verification status
      console.log(
        `Path: ${currentPath}, Partner has pending verification status, redirecting to verification status`
      );
      router.replace("/(main)/partner/verification-status");
      return;

    case "rejected":
      // If already on verification status page, stay there
      if (isVerificationStatusPage(currentPath)) {
        return;
      }

      // Otherwise, redirect to verification status
      console.log(
        `Path: ${currentPath}, Partner has rejected verification status, redirecting to verification status`
      );
      router.replace("/(main)/partner/verification-status");
      return;

    case "approved":
      // If on dashboard page, stay there
      if (isPartnerDashboardPage(currentPath)) {
        return;
      }

      // Otherwise, redirect to dashboard
      console.log(
        `Path: ${currentPath}, Partner is approved, redirecting to dashboard`
      );
      router.replace("/(main)/partner/(tabs)");
      return;

    default:
      // If verification status is undefined or not recognized
      // Redirect to registration
      console.log(
        `Path: ${currentPath}, Partner has unknown verification status, redirecting to registration`
      );
      router.replace("/(main)/partner/registration");
      return;
  }
}

/**
 * Routes a new user to the appropriate registration flow based on account type
 * @param accountType The selected account type
 */
export function routeToRegistration(
  accountType: UserProfile["userType"]
): void {
  if (accountType === "client") {
    router.push("/(main)/client/registration");
  } else if (accountType === "partner") {
    router.push("/(auth)/partner-basic-info");
  } else {
    router.push("/(auth)/account-type");
  }
}

// Simple path checking functions
function isLoginPage(path: string): boolean {
  return (
    path === "/login" ||
    path === "/account-type" ||
    path === "/partner-basic-info"
  );
}

function isClientRegistrationPage(path: string): boolean {
  return path.endsWith("/registration") && path.includes("client");
}

function isPartnerRegistrationPage(path: string): boolean {
  return path.endsWith("/registration") && path.includes("partner");
}

function isVerificationStatusPage(path: string): boolean {
  return path.includes("verification-status");
}

function isPartnerDashboardPage(path: string): boolean {
  return path.includes("partner") && path.includes("(tabs)");
}
