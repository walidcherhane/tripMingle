import {
  DistanceMatrixParams,
  LatLng,
  PlaceAutocompletePrediction,
  PlaceDetails,
  PlaceMatrixResponse,
  PlacesSearchParams,
} from "@/types/place";
import { googleMapsAPI } from "./config";

class PlacesService {
  async autocomplete(input: string, location?: LatLng) {
    try {
      const response = await googleMapsAPI.get(
        "/maps/api/place/autocomplete/json",
        {
          params: {
            input,
            location: location ? `${location.lat},${location.lng}` : undefined,
            radius: location ? 50000 : undefined,
            components: "country:ma", // Restrict to Morocco
            language: "en",
          },
        }
      );

      return response.data.predictions as PlaceAutocompletePrediction[];
    } catch (error) {
      console.error("Places autocomplete error:", error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string) {
    console.log("🚀 ~ PlacesService ~ getPlaceDetails ~ placeId:", placeId);
    try {
      const response = await googleMapsAPI.get("/maps/api/place/details/json", {
        params: {
          place_id: placeId,
          fields: "name,formatted_address,geometry,photos,rating,types",
        },
      });
      return response.data.result as PlaceDetails;
    } catch (error) {
      console.error("Place details error:", error);
      throw error;
    }
  }

  async searchNearby(params: PlacesSearchParams) {
    try {
      const response = await googleMapsAPI.get(
        "/maps/api/place/nearbysearch/json",
        {
          params: {
            location: params.location
              ? `${params.location.lat},${params.location.lng}`
              : undefined,
            radius: params.radius || 5000,
            type: params.type,
            keyword: params.query,
          },
        }
      );
      return response.data.results as PlaceDetails[];
    } catch (error) {
      console.error("Nearby search error:", error);
      throw error;
    }
  }

  async reverseGeocode(location: LatLng) {
    try {
      const response = await googleMapsAPI.get("/maps/api/geocode/json", {
        params: {
          latlng: `${location.lat},${location.lng}`,
        },
      });
      return response.data.results[0] as PlaceDetails;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
  }

  async getPlacePhoto(photoReference: string, maxWidth: number = 400) {
    try {
      const response = await googleMapsAPI.get("/maps/api/place/photo", {
        params: {
          photoreference: photoReference,
          maxwidth: maxWidth,
        },
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      console.error("Place photo error:", error);
      throw error;
    }
  }

  async getDistanceMatrix({ origin, destination }: DistanceMatrixParams) {
    console.log("[DEBUG] getDistanceMatrix service called", {
      origin,
      destination,
    });

    try {
      // Additional validation to prevent useless API calls
      if (
        !origin ||
        !destination ||
        Math.abs(origin.lat) < 0.001 ||
        Math.abs(origin.lng) < 0.001 ||
        Math.abs(destination.lat) < 0.001 ||
        Math.abs(destination.lng) < 0.001
      ) {
        console.log(
          "[DEBUG] getDistanceMatrix validation failed - invalid coordinates"
        );
        throw new Error("Invalid coordinates for distance matrix calculation");
      }

      console.log("[DEBUG] Making getDistanceMatrix API request");
      const response = await googleMapsAPI.get(
        "/maps/api/distancematrix/json",
        {
          params: {
            origins: `${origin.lat},${origin.lng}`,
            destinations: `${destination.lat},${destination.lng}`,
            mode: "driving",
          },
        }
      );

      // Check if we got a valid response
      if (response.data.status !== "OK") {
        console.log("[DEBUG] getDistanceMatrix API returned error status", {
          status: response.data.status,
        });
        throw new Error(`Distance matrix API error: ${response.data.status}`);
      }

      console.log("[DEBUG] getDistanceMatrix API request successful");
      return response.data as PlaceMatrixResponse;
    } catch (error) {
      // Avoid excessive error logging in production
      console.error(
        "Distance matrix error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }
}

export const placesService = new PlacesService();
