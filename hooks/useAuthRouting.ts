import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "expo-router";
import { routeUserByAuth, isPageAppropriate } from "@/utils/authRouting";

/**
 * Options for auth routing behavior
 */
interface AuthRoutingOptions {
  /** Skip redirection completely */
  skipRouting?: boolean;
  /** Only check if user is logged in, don't care about status */
  authCheckOnly?: boolean;
  /** Check if the current page is appropriate but don't redirect */
  checkOnly?: boolean;
}

/**
 * Hook for implementing auth-based routing in components
 * @param options Optional configuration options
 * @returns The current user and whether the current page is appropriate
 */
export function useAuthRouting(options?: AuthRoutingOptions) {
  const currentUser = useQuery(api.auth.getMe);
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Use a ref to track the last path we redirected from to prevent loops
  const lastRedirectPathRef = useRef<string | null>(null);

  // Calculate if current page is appropriate for user's status
  const isAppropriate = isPageAppropriate(currentUser, pathname);

  useEffect(() => {
    // Skip routing if explicitly requested
    if (options?.skipRouting) {
      return;
    }

    // Skip if we're already on the appropriate page
    if (isAppropriate) {
      console.log("Page is appropriate, no redirection needed:", pathname);
      return;
    }

    // // Skip if we just redirected from this path to prevent loops
    // if (pathname && lastRedirectPathRef.current === pathname) {
    //   console.log("Preventing redirect loop at:", pathname);
    //   return;
    // }

    // Skip if we're currently in the process of redirecting
    if (isRedirecting) {
      return;
    }

    // If only checking for authentication
    if (options?.authCheckOnly) {
      if (currentUser === null) {
        setIsRedirecting(true);
        lastRedirectPathRef.current = pathname || null;
        routeUserByAuth(null, pathname);
      }
      return;
    }

    // If only checking for appropriateness without redirecting
    if (options?.checkOnly) {
      return;
    }

    // Handle full routing logic
    if (pathname) {
      setIsRedirecting(true);
      lastRedirectPathRef.current = pathname;
      console.log("Routing from path:", pathname);
    }

    routeUserByAuth(currentUser, pathname);

    // Reset redirecting state after a short delay
    const timer = setTimeout(() => {
      setIsRedirecting(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    pathname,
    options?.skipRouting,
    options?.authCheckOnly,
    options?.checkOnly,
    isAppropriate,
    isRedirecting,
  ]);

  return {
    currentUser,
    isAppropriate,
    isRedirecting,
  };
}
