import * as Location from "expo-location";

export type LocationPermissionStatus = Location.PermissionStatus;
export type LocationObject = Location.LocationObject;
export type LocationAccuracy = Location.Accuracy;

class LocationService {
  async requestPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      throw error;
    }
  }

  async getCurrentLocation(
    accuracy: LocationAccuracy = Location.Accuracy.High
  ): Promise<LocationObject> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy,
      });
      return location;
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    }
  }

  async watchLocation(
    callback: (location: LocationObject) => void,
    accuracy: LocationAccuracy = Location.Accuracy.Balanced
  ): Promise<Location.LocationSubscription> {
    try {
      return await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: 5000,
          distanceInterval: 100,
        },
        callback
      );
    } catch (error) {
      console.error("Error watching location:", error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
