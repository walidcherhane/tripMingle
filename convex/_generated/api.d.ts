/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as auth from "../auth.js";
import type * as cron from "../cron.js";
import type * as documents from "../documents.js";
import type * as drivers from "../drivers.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as reviews from "../reviews.js";
import type * as savedLocations from "../savedLocations.js";
import type * as scheduledTrips from "../scheduledTrips.js";
import type * as storage from "../storage.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  auth: typeof auth;
  cron: typeof cron;
  documents: typeof documents;
  drivers: typeof drivers;
  http: typeof http;
  messages: typeof messages;
  notifications: typeof notifications;
  reviews: typeof reviews;
  savedLocations: typeof savedLocations;
  scheduledTrips: typeof scheduledTrips;
  storage: typeof storage;
  trips: typeof trips;
  users: typeof users;
  vehicles: typeof vehicles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
