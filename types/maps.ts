export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

export interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface LocationResult {
  id: string;
  name: string;
  address: string;
  type: "recent" | "popular" | "search" | "saved";
  latitude: number;
  longitude: number;
  category?: string;
}
