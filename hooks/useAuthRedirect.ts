import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { handleAuthRedirect } from "@/utils/authRedirect";
import { usePathname } from "expo-router";

/**
 * Hook that manages authentication redirection
 * @param options Optional configuration
 * @returns The current user from Convex
 */
export function useAuthRedirect(options?: {
  skipRedirect?: boolean;
  onlyRedirectIfNoUser?: boolean;
}) {
  const pathname = usePathname();
  const currentUser = useQuery(api.auth.getMe);

  useEffect(() => {
    // Skip redirection if explicitly requested
    if (options?.skipRedirect) {
      return;
    }

    // If onlyRedirectIfNoUser is true, only redirect when there's no user
    if (options?.onlyRedirectIfNoUser && currentUser !== null) {
      return;
    }

    // Handle redirection based on user status
    handleAuthRedirect(currentUser, pathname);
  }, [
    currentUser,
    pathname,
    options?.skipRedirect,
    options?.onlyRedirectIfNoUser,
  ]);

  return currentUser;
}
