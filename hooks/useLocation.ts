import { useContext, useCallback } from "react";
import { LocationContext } from "@/context/LocationContext";
import { LatLng } from "@/types/place";
export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  const getFormattedLocation = useCallback((): LatLng | null => {
    if (context.permissionStatus !== "granted" || !context.location) {
      return {
        lat: 0,
        lng: 0,
      };
    }

    return {
      lat: context.location.coords.latitude,
      lng: context.location.coords.longitude,
    };
  }, [context.location]);

  return {
    ...context,
    formattedLocation: getFormattedLocation(),
  };
};
