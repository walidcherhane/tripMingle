import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Stack } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  Smartphone,
  Tablet,
  Laptop,
  MapPin,
  Clock,
  XCircle,
} from "lucide-react-native";

// Mock active sessions data
const activeSessions = [
  {
    id: "1",
    deviceType: "mobile",
    deviceName: "iPhone 13",
    location: "Marrakech, Morocco",
    ipAddress: "192.168.1.1",
    lastActive: "2 minutes ago",
    current: true,
  },
  {
    id: "2",
    deviceType: "tablet",
    deviceName: "iPad Pro",
    location: "Casablanca, Morocco",
    ipAddress: "192.168.1.2",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    deviceType: "desktop",
    deviceName: "Chrome on Windows",
    location: "Rabat, Morocco",
    ipAddress: "192.168.1.3",
    lastActive: "1 day ago",
    current: false,
  },
];

export default function SessionsScreen() {
  const theme = useTheme();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Laptop;
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    Alert.alert(
      "End Session",
      "Are you sure you want to log out this device?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // Implement session logout logic
            console.log("Logging out session:", sessionId);
          },
        },
      ]
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      "Log Out All Devices",
      "Are you sure you want to log out all other devices?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out All",
          style: "destructive",
          onPress: () => {
            // Implement all sessions logout logic
            console.log("Logging out all sessions");
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Active Sessions",
        }}
      />

      <ScrollView style={styles.container}>
        <Card style={styles.infoCard}>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            These are the devices that are currently logged into your account.
            You can log out any session that you don't recognize.
          </Typography>
        </Card>

        {/* Current Session */}
        {activeSessions.map((session) => (
          <Card key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.deviceInfo}>
                <View
                  style={[
                    styles.deviceIcon,
                    { backgroundColor: theme.colors.primary.lightest },
                  ]}
                >
                  {React.createElement(getDeviceIcon(session.deviceType), {
                    size: 20,
                    color: theme.colors.primary.brand,
                  })}
                </View>
                <View>
                  <Typography variant="md" weight="medium">
                    {session.deviceName}
                  </Typography>
                  {session.current && (
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.success }}
                    >
                      Current Device
                    </Typography>
                  )}
                </View>
              </View>
              {!session.current && (
                <Pressable
                  onPress={() => handleLogoutSession(session.id)}
                  hitSlop={8}
                >
                  <XCircle size={20} color={theme.colors.error} />
                </Pressable>
              )}
            </View>

            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <MapPin size={16} color={theme.colors.gray[400]} />
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500], marginLeft: 8 }}
                >
                  {session.location}
                </Typography>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color={theme.colors.gray[400]} />
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500], marginLeft: 8 }}
                >
                  Active {session.lastActive}
                </Typography>
              </View>
              <Typography
                variant="sm"
                style={{ color: theme.colors.gray[500], marginTop: 4 }}
              >
                IP: {session.ipAddress}
              </Typography>
            </View>
          </Card>
        ))}

        {/* Logout All Button */}
        <Card style={styles.logoutCard}>
          <Button
            title="Log Out All Other Devices"
            variant="error"
            onPress={handleLogoutAll}
          />
          <Typography
            variant="sm"
            style={[styles.logoutNote, { color: theme.colors.gray[500] }]}
          >
            This will end all sessions except for your current device
          </Typography>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  infoCard: {
    margin: 16,
  },
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionDetails: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutCard: {
    margin: 16,
  },
  logoutNote: {
    textAlign: "center",
    marginTop: 8,
  },
});
