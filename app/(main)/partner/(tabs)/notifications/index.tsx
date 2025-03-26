// app/(main)/partner/(tabs)/notifications/index.tsx
import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Typography } from "@/components/ui/typography";
import { theme } from "@/theme";
import {
  MessageCircle,
  Car,
  DollarSign,
  Bell,
  ChevronLeft,
  MoreVertical,
} from "lucide-react-native";
import { router } from "expo-router";
import type { Notification } from "@/types/notification";
import { Popover } from "@/components/ui/popover";
import Tabs from "@/components/ui/tabs";
import { Tabs as RTabs } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "@/components/ui/toast";
import { SafeAreaView } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    height: Platform.OS === "ios" ? 44 : 56,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  tabIndicator: {
    height: 2,
    backgroundColor: theme.colors.primary.brand,
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
  },
  dateHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.gray[50],
  },
  notificationItem: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  unread: {
    backgroundColor: `${theme.colors.primary.brand}08`,
  },
  NotificationContentContainer: {
    alignItems: "flex-start",
    flex: 1,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
  },
  notificationMeta: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[500],
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary.brand,
    marginRight: theme.spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

const NotificationIcon: React.FC<{
  type: Notification["type"];
  color: string;
}> = ({ type, color }) => {
  switch (type) {
    case "trip":
      return <Car size={16} color={color} />;
    case "message":
      return <MessageCircle size={16} color={color} />;
    case "payment":
      return <DollarSign size={16} color={color} />;
    default:
      return <Bell size={16} color={color} />;
  }
};

const tabs = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const NotificationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] =
    React.useState<(typeof tabs)[number]["value"]>("all");
  const [showMenu, setShowMenu] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  // Get current user
  const { user, isLoading: isUserLoading } = useAuth();

  // Fetch notifications from Convex
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user
      ? {
          userId: user._id as Id<"users">,
          includeRead: activeTab !== "unread",
        }
      : "skip"
  );

  const unreadNotifications = useQuery(
    api.notifications.countUnreadNotifications,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  // Mutations for marking notifications as read
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsReadMutation = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "trip":
        return theme.colors.primary.brand;
      case "message":
        return theme.colors.info;
      case "payment":
        return theme.colors.success;
      default:
        return theme.colors.warning;
    }
  };

  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];

    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "read":
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const groupedNotifications = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey = date.toDateString();
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(notification);
    });
    return groups;
  }, [filteredNotifications]);

  const handleNotificationPress = async (notification: any) => {
    // If notification is unread, mark it as read
    if (!notification.read) {
      try {
        await markAsRead({ notificationId: notification._id });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Handle navigation based on notification type
    if (notification.type === "trip" && notification.relatedId) {
      // Navigate to trip details
      router.push(`/partner/trips/${notification.relatedId}` as any);
    } else if (notification.type === "message" && notification.relatedId) {
      // Navigate to messages
      router.push(`/partner/messages/${notification.relatedId}` as any);
    } else if (notification.type === "payment" && notification.relatedId) {
      // Navigate to payment details
      router.push(`/partner/payments/${notification.relatedId}` as any);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllAsReadMutation({ userId: user._id as Id<"users"> });
      setToastMessage("All notifications marked as read");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setToastMessage("Failed to mark notifications as read");
      setShowToast(true);
    }

    setShowMenu(false);
  };

  const renderMenuContent = () => (
    <Pressable
      style={{
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
      }}
      onPress={markAllAsRead}
    >
      <Typography>Mark all as read</Typography>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <RTabs.Screen
        options={{
          title: "Notifications",
          tabBarBadge:
            unreadNotifications !== 0 ? unreadNotifications : undefined,
        }}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {isUserLoading || notifications === undefined ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary.brand} />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.xl,
          }}
        >
          <Typography
            style={{ textAlign: "center" }}
            variant="md"
            weight="medium"
            color="gray.500"
          >
            No notifications{" "}
            {activeTab !== "all" ? `marked as ${activeTab}` : "yet"}
          </Typography>
        </View>
      ) : (
        <ScrollView>
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Typography weight="medium" color="gray.600">
                  {date}
                </Typography>
              </View>
              {notifications.map((notification) => (
                <Pressable
                  key={notification._id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unread,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: `${getIconColor(notification.type)}15`,
                      },
                    ]}
                  >
                    <NotificationIcon
                      type={notification.type}
                      color={getIconColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.NotificationContentContainer}>
                      <Typography weight="medium">
                        {notification.title}
                      </Typography>
                      <Typography
                        color="gray.600"
                        style={{
                          fontSize: theme.typography.sizes.sm,
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </View>
                    <View style={styles.notificationMeta}>
                      {!notification.read && <View style={styles.unreadDot} />}
                      <Typography style={styles.timestamp}>
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Typography>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type="success"
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
