import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);

  // In a real app, these would be fetched from the backend
  const [notificationSettings, setNotificationSettings] = useState<
    NotificationSetting[]
  >([
    {
      id: "trip_updates",
      title: "Trip Updates",
      description: "Receive notifications about your upcoming trips",
      enabled: true,
    },
    {
      id: "promotions",
      title: "Promotions",
      description: "Receive notifications about special offers and discounts",
      enabled: true,
    },
    {
      id: "account",
      title: "Account Updates",
      description: "Receive notifications about your account status",
      enabled: true,
    },
    {
      id: "partner_messages",
      title: "Partner Messages",
      description: "Receive notifications when a partner sends you a message",
      enabled: true,
    },
    {
      id: "payment",
      title: "Payment Updates",
      description: "Receive notifications about payment status and receipts",
      enabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationSettings(
      notificationSettings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const saveSettings = () => {
    // In a real app, this would save the settings to the backend
    console.log("Saving notification settings:", notificationSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Typography variant="lg" weight="semibold">
            Notification Preferences
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500], marginTop: 4 }}
          >
            Manage how you receive notifications
          </Typography>
        </View>

        {notificationSettings.map((setting) => (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="md" weight="medium">
                {setting.title}
              </Typography>
              <Typography
                variant="sm"
                style={{ color: theme.colors.gray[500], marginTop: 2 }}
              >
                {setting.description}
              </Typography>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => toggleNotification(setting.id)}
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary.brand,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </Card>

      <Card style={styles.emailPreferences}>
        <Typography variant="lg" weight="semibold">
          Email Preferences
        </Typography>
        <Typography
          variant="sm"
          style={{
            color: theme.colors.gray[500],
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          Manage how you receive emails
        </Typography>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Typography variant="md" weight="medium">
              Marketing Emails
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 2 }}
            >
              Receive emails about promotions and news
            </Typography>
          </View>
          <Switch
            value={true}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary.brand,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Typography variant="md" weight="medium">
              Trip Summary
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 2 }}
            >
              Receive email summaries after each trip
            </Typography>
          </View>
          <Switch
            value={true}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary.brand,
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button onPress={saveSettings} style={styles.saveButton}>
          Save Preferences
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  emailPreferences: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 32,
  },
  saveButton: {
    width: "100%",
  },
});
