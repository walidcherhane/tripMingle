import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const user = useQuery(api.auth.getMe);
  const isLoading = isAuthLoading || user === undefined;

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
