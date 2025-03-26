import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// Schedule the cron job to run every minute
const crons = cronJobs();

// Check for upcoming scheduled trips and send notifications
crons.interval(
  "check-scheduled-trips",
  { minutes: 5 }, // Run every 5 minutes to reduce overhead
  api.scheduledTrips.checkUpcomingTrips
);

// Export the cron jobs
export default crons;
