import { RoutePoint } from "@/types/maps";

const GOOGLE_MAPS_API_KEY = "AIzaSyASrlu1YwJeqx1tdMqk6JCS41tIkFrfNys";

export const getRoutePath = async (
  origin: RoutePoint,
  destination: RoutePoint
) => {
  try {
    // Replace YOUR_GOOGLE_MAPS_API_KEY with your actual API key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (!data.routes[0]) return null;

    // Decode the polyline points
    const points = decodePolyline(data.routes[0].overview_polyline.points);

    return points;
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

// Google Maps polyline decoder
function decodePolyline(encoded: string) {
  const points: RoutePoint[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let shift = 0,
      result = 0;

    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }

  return points;
}

export const calculateRegion = ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  originLatitude: number | null;
  originLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!originLatitude || !originLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: originLatitude,
      longitude: originLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(originLatitude, destinationLatitude);
  const maxLat = Math.max(originLatitude, destinationLatitude);
  const minLng = Math.min(originLongitude, destinationLongitude);
  const maxLng = Math.max(originLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (originLatitude + destinationLatitude) / 2;
  const longitude = (originLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};
