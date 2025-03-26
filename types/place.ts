export interface LatLng {
  lat: number;
  lng: number;
}

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceOpeningHours = {
  weekday_text: string[];
  special_days?: { date: string; hours: string }[];
};

type PlaceEditorialSummary = {
  overview: string;
  language_code: string;
};

type PlacePhoto = {
  photo_reference: string;
  width: number;
  height: number;
};

type PlusCode = {
  global_code: string;
  compound_code: string;
};

type PlaceReview = {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  time: number;
};

type Geometry = {
  location: LatLng;
  viewport: {
    northeast: LatLng;
    southwest: LatLng;
  };
};

export type PlaceDetails = {
  address_components?: AddressComponent[];
  adr_address?: string;
  business_status?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  curbside_pickup?: boolean;
  current_opening_hours?: PlaceOpeningHours;
  delivery?: boolean;
  dine_in?: boolean;
  editorial_summary?: PlaceEditorialSummary;
  formatted_address?: string;
  formatted_phone_number?: string;
  geometry?: Geometry;
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;
  international_phone_number?: string;
  name?: string;
  opening_hours?: PlaceOpeningHours;
  permanently_closed?: boolean;
  photos?: PlacePhoto[];
  place_id?: string;
  plus_code?: PlusCode;
  price_level?: 0 | 1 | 2 | 3 | 4;
  rating?: number;
  reference?: string; // deprecated
  reservable?: boolean;
  reviews?: PlaceReview[];
  scope?: string; // deprecated
  secondary_opening_hours?: PlaceOpeningHours[];
  serves_beer?: boolean;
  serves_breakfast?: boolean;
  serves_brunch?: boolean;
  serves_dinner?: boolean;
  serves_lunch?: boolean;
  serves_vegetarian_food?: boolean;
  serves_wine?: boolean;
  takeout?: boolean;
  types?: PlaceType[];
  url?: string;
  user_ratings_total?: number;
  utc_offset?: number;
  vicinity?: string;
  website?: string;
  wheelchair_accessible_entrance?: boolean;
};

export interface PlacesSearchParams {
  query?: string;
  location?: LatLng;
  radius?: number;
  type?: string;
}

export interface DistanceMatrixParams {
  origin: LatLng;
  destination: LatLng;
}

export interface PlaceAutocompleteMatchedSubstring {
  offset: number;
  length: number;
}

export interface PlaceAutocompleteStructuredFormat {
  main_text: string;
  main_text_matched_substrings: PlaceAutocompleteMatchedSubstring[];
  secondary_text: string;
}

export interface PlaceAutocompleteTerm {
  offset: number;
  value: string;
}

export interface PlaceAutocompletePrediction {
  description: string;
  matched_substrings: PlaceAutocompleteMatchedSubstring[];
  structured_formatting: PlaceAutocompleteStructuredFormat;
  terms: PlaceAutocompleteTerm[];
  distance_meters?: number;
  place_id?: string;
  types?: PlaceType[];
}

export interface PlaceMatrixElement {
  status: "OK" | "NOT_FOUND" | "ZERO_RESULTS";
  duration: {
    text: string;
    value: number;
  };
  distance: {
    text: string;
    value: number;
  };
}

export interface PlaceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {
    elements: PlaceMatrixElement[];
  }[];
  status:
    | "OK"
    | "INVALID_REQUEST"
    | "MAX_ELEMENTS_EXCEEDED"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "UNKNOWN_ERROR";
}

export type PlaceType =
  | "accounting"
  | "airport"
  | "amusement_park"
  | "aquarium"
  | "art_gallery"
  | "atm"
  | "bakery"
  | "bank"
  | "bar"
  | "beauty_salon"
  | "bicycle_store"
  | "book_store"
  | "bowling_alley"
  | "bus_station"
  | "cafe"
  | "campground"
  | "car_dealer"
  | "car_rental"
  | "car_repair"
  | "car_wash"
  | "casino"
  | "cemetery"
  | "church"
  | "city_hall"
  | "clothing_store"
  | "convenience_store"
  | "courthouse"
  | "dentist"
  | "department_store"
  | "doctor"
  | "drugstore"
  | "electrician"
  | "electronics_store"
  | "embassy"
  | "fire_station"
  | "florist"
  | "funeral_home"
  | "furniture_store"
  | "gas_station"
  | "gym"
  | "hair_care"
  | "hardware_store"
  | "hindu_temple"
  | "home_goods_store"
  | "hospital"
  | "insurance_agency"
  | "jewelry_store"
  | "laundry"
  | "lawyer"
  | "library"
  | "light_rail_station"
  | "liquor_store"
  | "local_government_office"
  | "locksmith"
  | "lodging"
  | "meal_delivery"
  | "meal_takeaway"
  | "mosque"
  | "movie_rental"
  | "movie_theater"
  | "moving_company"
  | "museum"
  | "night_club"
  | "painter"
  | "park"
  | "parking"
  | "pet_store"
  | "pharmacy"
  | "physiotherapist"
  | "plumber"
  | "police"
  | "post_office"
  | "primary_school"
  | "real_estate_agency"
  | "restaurant"
  | "roofing_contractor"
  | "rv_park"
  | "school"
  | "secondary_school"
  | "shoe_store"
  | "shopping_mall"
  | "spa"
  | "stadium"
  | "storage"
  | "store"
  | "subway_station"
  | "supermarket"
  | "synagogue"
  | "taxi_stand"
  | "tourist_attraction"
  | "train_station"
  | "transit_station"
  | "travel_agency"
  | "university"
  | "veterinary_care"
  | "zoo"
  | "administrative_area_level_1"
  | "administrative_area_level_2"
  | "administrative_area_level_3"
  | "administrative_area_level_4"
  | "administrative_area_level_5"
  | "administrative_area_level_6"
  | "administrative_area_level_7"
  | "archipelago"
  | "colloquial_area"
  | "continent"
  | "country"
  | "establishment"
  | "finance"
  | "floor"
  | "food"
  | "general_contractor"
  | "geocode"
  | "health"
  | "intersection"
  | "landmark"
  | "locality"
  | "natural_feature"
  | "neighborhood"
  | "place_of_worship"
  | "plus_code"
  | "point_of_interest"
  | "political"
  | "post_box"
  | "postal_code"
  | "postal_code_prefix"
  | "postal_code_suffix"
  | "postal_town"
  | "premise"
  | "room"
  | "route"
  | "street_address"
  | "street_number"
  | "sublocality"
  | "sublocality_level_1"
  | "sublocality_level_2"
  | "sublocality_level_3"
  | "sublocality_level_4"
  | "sublocality_level_5"
  | "subpremise"
  | "town_square";
