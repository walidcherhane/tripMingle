import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import {
  Bell,
  Car,
  CreditCard,
  MessageCircle,
  Tag,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useFocusEffect } from "@react-navigation/native";
import { Doc } from "@/convex/_generated/dataModel";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const [refreshing, setRefreshing] = useState(false);
  const [showRead, setShowRead] = useState(true);
  const router = useRouter();

  // Fetch notifications from Convex
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    currentUser?._id
      ? {
          userId: currentUser._id,
          includeRead: showRead,
        }
      : "skip"
  );

  // Mutations
  const markAsReadMutation = useMutation(
    api.notifications.markNotificationAsRead
  );
  const markAllAsReadMutation = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  // Refresh notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      // This will refetch when the screen is focused
      return () => {};
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The Convex query will auto-refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsRead = useCallback(
    (notificationId: Id<"notifications">) => {
      markAsReadMutation({ notificationId });
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    if (currentUser?._id) {
      markAllAsReadMutation({ userId: currentUser._id });
    }
  }, [currentUser, markAllAsReadMutation]);

  const handleNotificationAction = useCallback(
    (notification: Doc<"notifications">) => {
      // Mark notification as read first
      markAsReadMutation({ notificationId: notification._id });

      // Show alert with the action that would be taken
      let message = "";

      if (notification.type === "trip") {
        if (notification.message.includes("confirmed")) {
          message = "Navigating to confirmed trip details";
        } else if (notification.message.includes("completed")) {
          message = "Navigating to completed trip summary";
        } else if (notification.message.includes("driver")) {
          message = "Viewing driver details";
        } else if (
          notification.message.includes("history") ||
          notification.message.includes("recent trip")
        ) {
          message = "Viewing trip history";
        } else if (notification.message.includes("scheduled")) {
          message = "Viewing scheduled trips";
        } else {
          message = "Viewing trip details";
        }
      } else if (notification.type === "payment") {
        message = "Viewing payment details";
      } else if (notification.type === "message") {
        message = "Opening message conversation";
      } else {
        message = "Opening notification details";
      }

      // Show alert about what would happen
      Alert.alert("Notification Action", message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    },
    [markAsReadMutation]
  );

  const getNotificationIcon = (type: string, message: string) => {
    // For trip notifications, differentiate based on the message content
    if (type === "trip") {
      if (message.includes("confirmed")) {
        return CheckCircle;
      } else if (message.includes("completed")) {
        return Car;
      } else if (message.includes("canceled")) {
        return Bell;
      } else if (message.includes("driver")) {
        return Car;
      } else if (message.includes("scheduled")) {
        return Calendar;
      } else if (
        message.includes("history") ||
        message.includes("recent trip")
      ) {
        return Clock;
      } else {
        return Car;
      }
    }

    // Handle other notification types
    switch (type) {
      case "payment":
        return CreditCard;
      case "message":
        return MessageCircle;
      case "system":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const renderNotificationItem = ({ item }: { item: Doc<"notifications"> }) => {
    const NotificationIcon = getNotificationIcon(item.type, item.message);

    return (
      <Pressable
        key={item._id}
        style={({ pressed }) => [
          styles.notificationItem,
          !item.read && styles.unreadNotification,
          pressed && styles.pressed,
        ]}
        onPress={() => handleNotificationAction(item)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary.lightest },
          ]}
        >
          <NotificationIcon size={20} color={theme.colors.primary.brand} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Typography variant="md" weight="medium">
              {item.title}
            </Typography>
            <Typography variant="xs" style={{ color: theme.colors.gray[500] }}>
              {formatDate(item._creationTime)}
            </Typography>
          </View>
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[600], marginTop: 4 }}
          >
            {item.message}
          </Typography>
        </View>
        {!item.read && <View style={styles.unreadIndicator} />}
      </Pressable>
    );
  };

  // Group notifications by date category
  const groupedNotifications = useMemo(() => {
    if (!notifications) return {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: Record<string, Doc<"notifications">[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    // Sort notifications by creation time (newest first)
    const sortedNotifications = [...notifications].sort(
      (a, b) => b._creationTime - a._creationTime
    );

    sortedNotifications.forEach((notification) => {
      const creationDate = new Date(notification._creationTime);
      creationDate.setHours(0, 0, 0, 0);

      if (creationDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (creationDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (creationDate.getTime() >= lastWeek.getTime()) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  // Render a section of notifications
  const renderNotificationSection = (
    title: string,
    notificationList: Doc<"notifications">[]
  ) => {
    if (notificationList.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Typography variant="sm" weight="medium" style={styles.sectionTitle}>
            {title}
          </Typography>
          <View style={styles.badge}>
            <Typography variant="xs" style={styles.badgeText}>
              {notificationList.length}
            </Typography>
          </View>
        </View>
        {notificationList.map((item) => renderNotificationItem({ item }))}
      </View>
    );
  };

  // Loading state
  if (notifications === undefined && currentUser) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  // If we have notifications, render them
  return (
    <View style={styles.container}>
      {currentUser && (
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={() => setShowRead(!showRead)}
              style={styles.filterButton}
            >
              <Typography
                variant="sm"
                style={{ color: theme.colors.primary.brand }}
              >
                {showRead ? "Hide Read" : "Show All"}
              </Typography>
            </Pressable>
            {notifications && notifications.length > 0 && (
              <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.primary.brand }}
                >
                  Mark all as read
                </Typography>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {notifications && notifications.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderNotificationSection("Today", groupedNotifications.today)}
          {renderNotificationSection(
            "Yesterday",
            groupedNotifications.yesterday
          )}
          {renderNotificationSection(
            "This Week",
            groupedNotifications.thisWeek
          )}
          {renderNotificationSection("Older", groupedNotifications.older)}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={theme.colors.gray[300]} />
          <Typography
            variant="lg"
            weight="medium"
            style={{
              color: theme.colors.gray[500],
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No Notifications
          </Typography>
          <Typography
            variant="sm"
            style={{
              color: theme.colors.gray[400],
              textAlign: "center",
              marginTop: 8,
            }}
          >
            You don't have any notifications yet
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    alignItems: "stretch",
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#F0F9FF",
  },
  pressed: {
    opacity: 0.9,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    alignSelf: "flex-start",
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#4B5563",
  },
});
