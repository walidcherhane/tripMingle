import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to get the total number of trips for a user
 * @param userId The ID of the user to get the trip count for
 * @returns An object containing the total trips count and loading state
 */
export function useTotalTrips(userId: Id<"users"> | undefined | null) {
  const totalTrips = useQuery(
    api.trips.countUserTrips,
    userId ? { userId } : "skip"
  );

  return {
    totalTrips: totalTrips ?? 0,
    isLoading:
      totalTrips === undefined && userId !== undefined && userId !== null,
  };
}
