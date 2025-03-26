// utils/date.ts

// Types for formatting options
type TimeFormat = "12h" | "24h";
type DateFormat = "short" | "medium" | "long";

interface FormatOptions {
  timeFormat?: TimeFormat;
  dateFormat?: DateFormat;
  includeYear?: boolean;
  includeTime?: boolean;
}

/**
 * Format time string from date
 */
export const formatTime = (
  date: string | Date,
  format: TimeFormat = "24h"
): string => {
  const d = new Date(date);
  if (format === "12h") {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format date string
 */
export const formatDate = (
  date: string | Date,
  format: DateFormat = "medium"
): string => {
  const d = new Date(date);

  switch (format) {
    case "short":
      return d.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      });
    case "long":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    default:
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  }
};

/**
 * Format full date and time
 */
export const formatDateTime = (
  date: string | Date,
  options: FormatOptions = {}
): string => {
  const {
    timeFormat = "24h",
    dateFormat = "medium",
    includeYear = false,
    includeTime = true,
  } = options;

  const d = new Date(date);
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: dateFormat === "long" ? "long" : "short",
    month: dateFormat === "short" ? "numeric" : "short",
    day: "numeric",
    ...(includeYear && { year: "numeric" }),
  };

  if (includeTime) {
    return `${d.toLocaleDateString("en-US", dateOptions)} ${formatTime(
      d,
      timeFormat
    )}`;
  }

  return d.toLocaleDateString("en-US", dateOptions);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);
  const absoluteDiff = Math.abs(diffInSeconds);

  // Future or past
  const suffix = diffInSeconds < 0 ? "ago" : "in";

  // Convert to appropriate unit
  if (absoluteDiff < 60) {
    return diffInSeconds < 0 ? "just now" : "in a moment";
  } else if (absoluteDiff < 3600) {
    const minutes = Math.floor(absoluteDiff / 60);
    return `${suffix} ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (absoluteDiff < 86400) {
    const hours = Math.floor(absoluteDiff / 3600);
    return `${suffix} ${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (absoluteDiff < 604800) {
    const days = Math.floor(absoluteDiff / 86400);
    return `${suffix} ${days} day${days > 1 ? "s" : ""}`;
  } else {
    return formatDate(d);
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is within the current week
 */
export const isThisWeek = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return d >= weekStart && d <= weekEnd;
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Get formatted time range
 */
export const formatTimeRange = (
  startDate: string | Date,
  endDate: string | Date,
  format: TimeFormat = "24h"
): string => {
  return `${formatTime(startDate, format)} - ${formatTime(endDate, format)}`;
};

/**
 * Check if a date has passed
 */
export const hasPassed = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

/**
 * Get start and end of day
 */
export const getDayBounds = (date: string | Date) => {
  const d = new Date(date);
  const start = new Date(d.setHours(0, 0, 0, 0));
  const end = new Date(d.setHours(23, 59, 59, 999));
  return { start, end };
};

/**
 * Format date to API expected format
 */
export const formatForAPI = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse date from API
 */
export const parseFromAPI = (dateString: string): Date => {
  return new Date(dateString);
};
