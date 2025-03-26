import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { placesService } from "@/services/google/places";
import {
  DistanceMatrixParams,
  LatLng,
  PlacesSearchParams,
} from "@/types/place";
import { useMemo } from "react";

export const placesKeys = {
  all: ["places"] as const,
  autocomplete: (query: string, location?: LatLng) =>
    [...placesKeys.all, "autocomplete", query, location] as const,
  details: (placeId: string) =>
    [...placesKeys.all, "details", placeId] as const,
  nearby: (params: PlacesSearchParams) =>
    [...placesKeys.all, "nearby", params] as const,
  geocode: (location: LatLng) =>
    [...placesKeys.all, "geocode", location] as const,
  distanceMatrix: (params: DistanceMatrixParams) =>
    [...placesKeys.all, "distanceMatrix", params] as const,
};

export const usePlacesQuery = () => {
  const useAutocomplete = (query: string, location?: LatLng) =>
    useQuery({
      queryKey: placesKeys.autocomplete(query, location),
      queryFn: () => placesService.autocomplete(query, location),
      enabled: query.length > 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const usePlaceDetails = (placeId: string) =>
    useQuery({
      queryKey: placesKeys.details(placeId),
      queryFn: () => placesService.getPlaceDetails(placeId),
      enabled: !!placeId,
      staleTime: 1000 * 60 * 30, // 30 minutes
    });

  const useNearbySearch = (params: PlacesSearchParams) =>
    useQuery({
      queryKey: placesKeys.nearby(params),
      queryFn: () => placesService.searchNearby(params),
      enabled: !!params.location,
      staleTime: 1000 * 60 * 15, // 15 minutes
    });

  const useReverseGeocode = (location: LatLng) =>
    useQuery({
      queryKey: placesKeys.geocode(location),
      queryFn: () => placesService.reverseGeocode(location),
      enabled:
        !!location.lat &&
        !!location.lng &&
        location.lat !== 0 &&
        location.lng !== 0,
      staleTime: 1000 * 60 * 60, // 1 hour
    });

  const useDistanceMatrix = (params: DistanceMatrixParams, enabled = true) => {
    console.log("[DEBUG] useDistanceMatrix hook called", {
      origin: params.origin,
      destination: params.destination,
      enabled,
    });

    // Check if coordinates are valid (non-zero and defined)
    const hasValidCoordinates =
      !!params.origin?.lat &&
      !!params.origin?.lng &&
      !!params.destination?.lat &&
      !!params.destination?.lng &&
      Math.abs(params.origin.lat) > 0.001 &&
      Math.abs(params.origin.lng) > 0.001 &&
      Math.abs(params.destination.lat) > 0.001 &&
      Math.abs(params.destination.lng) > 0.001;

    console.log(
      "[DEBUG] useDistanceMatrix hasValidCoordinates:",
      hasValidCoordinates
    );

    // Stable queryKey to prevent unnecessary re-renders
    // Only include the relevant parts of the coordinates with fixed precision
    const queryKey = useMemo(() => {
      if (!hasValidCoordinates)
        return placesKeys.distanceMatrix({
          origin: { lat: 0, lng: 0 },
          destination: { lat: 0, lng: 0 },
        });

      return placesKeys.distanceMatrix({
        origin: {
          lat: Number(params.origin.lat.toFixed(6)),
          lng: Number(params.origin.lng.toFixed(6)),
        },
        destination: {
          lat: Number(params.destination.lat.toFixed(6)),
          lng: Number(params.destination.lng.toFixed(6)),
        },
      });
    }, [
      hasValidCoordinates,
      params.origin?.lat,
      params.origin?.lng,
      params.destination?.lat,
      params.destination?.lng,
    ]);

    return useQuery({
      queryKey,
      queryFn: () => {
        console.log("[DEBUG] Distance matrix API call initiated");
        return placesService.getDistanceMatrix(params);
      },
      enabled: enabled && hasValidCoordinates,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // Garbage collection after 10 minutes
      retry: 1, // Only retry once to avoid too many failed requests
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch when network reconnects
    });
  };

  return {
    useAutocomplete,
    usePlaceDetails,
    useNearbySearch,
    useReverseGeocode,
    useDistanceMatrix,
  };
};
