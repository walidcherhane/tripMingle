import { query } from "./_generated/server";
import { v } from "convex/values";

// Get available drivers for clients
export const getAvailableDrivers = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    maxDistance: v.optional(v.number()), // in kilometers
    vehicleCategory: v.optional(
      v.union(
        v.literal("standard"),
        v.literal("premium"),
        v.literal("luxury"),
        v.literal("van")
      )
    ),
    minCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all partners who are verified
    const partners = await ctx.db
      .query("users")
      .withIndex("by_userType", (q) => q.eq("userType", "partner"))
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect();

    // Get all active vehicles
    const vehicles = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Filter vehicles by category if specified
    const filteredVehicles = args.vehicleCategory
      ? vehicles.filter((vehicle) => vehicle.category === args.vehicleCategory)
      : vehicles;

    // Filter vehicles by capacity if specified
    const capacityFilteredVehicles =
      args.minCapacity !== undefined
        ? filteredVehicles.filter(
            (vehicle) => vehicle.capacity >= (args.minCapacity || 0)
          )
        : filteredVehicles;

    // Match partners with their vehicles
    const availableDrivers = partners
      .map((partner) => {
        // Find all vehicles for this partner
        const partnerVehicles = capacityFilteredVehicles.filter(
          (vehicle) => vehicle.ownerId === partner._id
        );

        if (partnerVehicles.length === 0) {
          return null; // Skip partners with no matching vehicles
        }

        // For each partner, we'll use their first matching vehicle for now
        // In a real app, you might want to handle multiple vehicles differently
        const primaryVehicle = partnerVehicles[0];

        // Calculate a simulated distance and ETA
        // In a real app, you would use actual geolocation data stored for each driver
        // and calculate real distances using the Haversine formula or a mapping service
        const simulatedDistance = calculateSimulatedDistance(
          args.latitude,
          args.longitude,
          partner._id
        );

        // Skip drivers that are too far away if maxDistance is specified
        if (args.maxDistance && simulatedDistance > args.maxDistance) {
          return null;
        }

        const simulatedEta = Math.round(simulatedDistance * 2); // Rough estimate: 2 min per km

        return {
          id: partner._id,
          name: `${partner.firstName} ${partner.lastName}`,
          photo: partner.profileImage
            ? { _id: partner.profileImage }
            : "https://placehold.co/600x400/png", // Fallback image
          vehicle: {
            id: primaryVehicle._id,
            model: `${primaryVehicle.brand} ${primaryVehicle.model}`,
            type: primaryVehicle.category,
            image:
              primaryVehicle.images.length > 0
                ? { _id: primaryVehicle.images[0] }
                : "https://placehold.co/600x400/png", // Fallback image
            capacity: primaryVehicle.capacity,
          },
          rating: partner.rating ?? 4.5, // Default rating if none exists
          distance: `${simulatedDistance.toFixed(1)} km`,
          eta: `${simulatedEta} min`,
          priceRange: {
            min: Math.round(primaryVehicle.baseFare),
            max: Math.round(primaryVehicle.baseFare * 1.5), // Estimated max price
          },
          status: getDriverStatus(partner._id),
        };
      })
      .filter(Boolean); // Remove null entries

    return availableDrivers;
  },
});

export const getDriverById = query({
  args: {
    driverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.driverId);
  },
});
// Helper function to calculate a simulated distance
// In a real app, you would use actual geolocation data and proper distance calculation
function calculateSimulatedDistance(
  clientLat: number,
  clientLng: number,
  driverId: string
) {
  // This is a placeholder function that generates a random distance
  // In a real app, you would store driver locations and calculate actual distances

  // Use the driver ID as a seed for a deterministic but seemingly random distance
  const hash = driverId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Generate a distance between 0.5 and 5 km
  return 0.5 + (hash % 45) / 10;
}

// Helper function to determine driver status
// In a real app, this would be based on the driver's actual status in the system
function getDriverStatus(driverId: string) {
  // This is a placeholder function that assigns a status based on the driver ID
  // In a real app, you would have a proper status tracking system

  // Use the driver ID to deterministically assign a status
  const hash = driverId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // 80% chance of "available", 20% chance of "finishing_soon"
  return hash % 5 === 0 ? "finishing_soon" : "available";
}
