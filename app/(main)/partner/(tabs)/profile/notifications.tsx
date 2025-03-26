// app/(main)/partner/profile/notifications.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { Stack } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import {
  Bell,
  Car,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react-native";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
}

const notificationGroups = [
  {
    title: "Trip Notifications",
    settings: [
      {
        id: "new_requests",
        title: "New Trip Requests",
        description: "Get notified when you receive new trip requests",
        icon: Car,
        enabled: true,
      },
      {
        id: "trip_updates",
        title: "Trip Updates",
        description: "Changes to scheduled trips, cancellations, etc.",
        icon: Bell,
        enabled: true,
      },
      {
        id: "trip_reminders",
        title: "Trip Reminders",
        description: "Reminders for upcoming trips",
        icon: Bell,
        enabled: true,
      },
    ],
  },
  {
    title: "Documents & Vehicle",
    settings: [
      {
        id: "doc_expiry",
        title: "Document Expiry",
        description: "Notifications about document expiration dates",
        icon: FileText,
        enabled: true,
      },
      {
        id: "maintenance",
        title: "Maintenance Reminders",
        description: "Vehicle maintenance and service reminders",
        icon: Settings,
        enabled: true,
      },
    ],
  },
  {
    title: "Messages & Support",
    settings: [
      {
        id: "messages",
        title: "Messages",
        description: "New messages from customers and support",
        icon: MessageSquare,
        enabled: true,
      },
      {
        id: "support",
        title: "Support Updates",
        description: "Updates on your support requests",
        icon: Bell,
        enabled: true,
      },
    ],
  },
  {
    title: "Payments",
    settings: [
      {
        id: "earnings",
        title: "Earnings",
        description: "New earnings and payment confirmations",
        icon: CreditCard,
        enabled: true,
      },
    ],
  },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = React.useState(notificationGroups);

  const handleToggle = (groupIndex: number, settingIndex: number) => {
    const newSettings = [...settings];
    newSettings[groupIndex].settings[settingIndex].enabled =
      !newSettings[groupIndex].settings[settingIndex].enabled;
    setSettings(newSettings);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
        }}
      />

      <ScrollView style={styles.container}>
        {settings.map((group, groupIndex) => (
          <Card key={group.title} style={styles.section}>
            <Typography
              variant="lg"
              weight="semibold"
              style={styles.groupTitle}
            >
              {group.title}
            </Typography>

            {group.settings.map((setting, settingIndex) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  settingIndex < group.settings.length - 1 && styles.itemBorder,
                ]}
              >
                <View style={styles.settingInfo}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: theme.colors.primary.lightest },
                    ]}
                  >
                    <setting.icon
                      size={20}
                      color={theme.colors.primary.brand}
                    />
                  </View>
                  <View style={styles.settingText}>
                    <Typography variant="md" weight="medium">
                      {setting.title}
                    </Typography>
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500] }}
                    >
                      {setting.description}
                    </Typography>
                  </View>
                </View>

                <Switch
                  value={setting.enabled}
                  onValueChange={() => handleToggle(groupIndex, settingIndex)}
                  trackColor={{
                    false: theme.colors.gray[200],
                    true: theme.colors.primary.brand,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </Card>
        ))}

        <Typography
          variant="sm"
          style={[styles.note, { color: theme.colors.gray[500] }]}
        >
          You can also manage your notification preferences in your device
          settings
        </Typography>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  groupTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  note: {
    margin: 16,
    textAlign: "center",
  },
});
