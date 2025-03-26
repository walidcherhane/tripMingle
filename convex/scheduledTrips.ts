import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Check for upcoming scheduled trips and send notifications
export const checkUpcomingTrips = mutation({
  args: {},
  handler: async (ctx) => {
    // Get current timestamp
    const now = Date.now();

    // Query for scheduled trips that are coming up soon
    const upcomingTrips = await ctx.db
      .query("trips")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.eq(q.field("timing.isScheduled"), true)
        )
      )
      .collect();

    // Process each trip to see if we need to send notifications
    let notificationsSent = 0;
    for (const trip of upcomingTrips) {
      try {
        // Parse the scheduled departure time
        const scheduledTime = new Date(trip.timing.departureDate!).getTime();

        // Calculate how many minutes until departure
        const minutesUntilDeparture = Math.round(
          (scheduledTime - now) / (60 * 1000)
        );

        // If trip is 30 minutes away, send a notification
        if (minutesUntilDeparture <= 30 && minutesUntilDeparture > 25) {
          await sendReminderNotification(ctx, trip._id, 30);
          notificationsSent++;
        }

        // If trip is 15 minutes away, send another notification
        if (minutesUntilDeparture <= 15 && minutesUntilDeparture > 10) {
          await sendReminderNotification(ctx, trip._id, 15);
          notificationsSent++;
        }

        // If trip is 5 minutes away, send a final reminder
        if (minutesUntilDeparture <= 5 && minutesUntilDeparture > 0) {
          await sendReminderNotification(ctx, trip._id, 5);
          notificationsSent++;
        }
      } catch (error) {
        console.error("Error processing scheduled trip:", error);
        continue;
      }
    }

    return { processed: upcomingTrips.length, notificationsSent };
  },
});

// Helper function to send reminder notifications
async function sendReminderNotification(
  ctx: any,
  tripId: Id<"trips">,
  minutesBefore: number
) {
  // Get trip details
  const trip = await ctx.db.get(tripId);
  if (!trip) return;

  // Create notification for the client
  if (trip.clientId) {
    await ctx.db.insert("notifications", {
      userId: trip.clientId,
      type: "trip",
      title: "Upcoming Trip Reminder",
      message: `Your scheduled trip is coming up in ${minutesBefore} minutes. Please be ready at the pickup location.`,
      relatedId: String(tripId),
      timestamp: Date.now(),
      read: false,
    });
  }

  // If there's a partner assigned, notify them too
  if (trip.partnerId) {
    await ctx.db.insert("notifications", {
      userId: trip.partnerId,
      type: "trip",
      title: "Upcoming Trip Reminder",
      message: `You have a scheduled trip starting in ${minutesBefore} minutes. Please prepare to pick up your passenger.`,
      relatedId: String(tripId),
      timestamp: Date.now(),
      read: false,
    });
  }
}
