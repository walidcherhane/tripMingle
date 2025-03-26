import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  locationService,
  LocationObject,
  LocationPermissionStatus,
} from "@/services/location";
import * as Location from "expo-location";

interface LocationContextType {
  location: LocationObject | null;
  permissionStatus: LocationPermissionStatus | null;
  error: Error | null;
  requestPermission: () => Promise<void>;
  getCurrentLocation: () => Promise<LocationObject | null>;
  isLoading: boolean;
}

export const LocationContext = createContext<LocationContextType>({
  location: null,
  permissionStatus: null,
  error: null,
  requestPermission: async () => {},
  getCurrentLocation: async () => null,
  isLoading: false,
});

interface LocationProviderProps {
  children: React.ReactNode;
  watchLocation?: boolean;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
  watchLocation = false,
}) => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const status = await locationService.requestPermission();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        throw new Error("Location permission not granted");
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (location) {
      return location;
    }
    try {
      setIsLoading(true);
      if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        await requestPermission();
      }

      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      setError(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const setupLocationWatch = async () => {
      if (
        watchLocation &&
        permissionStatus === Location.PermissionStatus.GRANTED
      ) {
        locationSubscription = await locationService.watchLocation(
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      }
    };

    setupLocationWatch();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [watchLocation, permissionStatus]);

  return (
    <LocationContext.Provider
      value={{
        location,
        permissionStatus,
        error,
        requestPermission,
        getCurrentLocation,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
