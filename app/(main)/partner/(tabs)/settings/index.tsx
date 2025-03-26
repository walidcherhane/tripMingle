import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Linking,
  SafeAreaView,
} from "react-native";
import { Stack, router } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import {
  Lock,
  Fingerprint,
  MapPin,
  Bell,
  Moon,
  Map,
  Info,
  Trash2,
  ChevronRight,
  Shield,
  FileText,
  LogOut,
} from "lucide-react-native";
import { useAuthActions } from "@convex-dev/auth/dist/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SettingsScreen() {
  const { signOut } = useAuthActions();
  const theme = useTheme();
  const [useBiometric, setUseBiometric] = React.useState(false);
  const [shareLocation, setShareLocation] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = React.useState(true);

  const currentUser = useQuery(api.auth.getMe);

  const settingSections = [
    {
      title: "Account & Security",
      items: [
        {
          icon: Lock,
          title: "Change Password",
          onPress: () =>
            router.push("/(main)/partner/(tabs)/settings/password"),
        },
        {
          icon: Fingerprint,
          title: "Use Fingerprint/Face ID",
          type: "toggle",
          value: useBiometric,
          onToggle: setUseBiometric,
        },
        {
          icon: Shield,
          title: "Active Sessions",
          onPress: () =>
            router.push("/(main)/partner/(tabs)/settings/sessions"),
        },
      ],
    },
    {
      title: "App Preferences",
      items: [
        {
          icon: Moon,
          title: "Dark Mode",
          type: "toggle",
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Map,
          title: "Use Google Maps",
          type: "toggle",
          value: useGoogleMaps,
          onToggle: setUseGoogleMaps,
        },
        {
          icon: MapPin,
          title: "Location Sharing",
          type: "toggle",
          value: shareLocation,
          onToggle: setShareLocation,
        },
      ],
    },
    {
      title: "Legal & About",
      items: [
        {
          icon: FileText,
          title: "Terms of Service",
          onPress: () => Linking.openURL("https://your-website.com/terms"),
        },
        {
          icon: Shield,
          title: "Privacy Policy",
          onPress: () => Linking.openURL("https://your-website.com/privacy"),
        },
        {
          icon: Info,
          title: "About App",
          subtitle: "Version 1.0.0",
          onPress: () => router.push("/(main)/partner/(tabs)/settings/about"),
        },
      ],
    },
    {
      title: "Data & Storage",
      items: [
        {
          icon: Trash2,
          title: "Clear Cache",
          subtitle: "45 MB used",
          onPress: () => {
            /* Handle clear cache */
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number, isLast: boolean) => (
    <Pressable
      key={item.title}
      style={[styles.settingItem, !isLast && styles.itemBorder]}
      onPress={item.onPress}
      disabled={item.type === "toggle"}
    >
      <View style={styles.settingInfo}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary.lightest },
          ]}
        >
          <item.icon size={20} color={theme.colors.primary.brand} />
        </View>
        <View style={styles.settingText}>
          <Typography variant="md">{item.title}</Typography>
          {item.subtitle && (
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              {item.subtitle}
            </Typography>
          )}
        </View>
      </View>

      {item.type === "toggle" ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{
            false: theme.colors.gray[200],
            true: theme.colors.primary.brand,
          }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <ChevronRight size={20} color={theme.colors.gray[400]} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {settingSections.map((section, sectionIndex) => (
          <Card key={section.title} style={styles.section}>
            <Typography
              variant="lg"
              weight="semibold"
              style={styles.sectionTitle}
            >
              {section.title}
            </Typography>

            {section.items.map((item, itemIndex) =>
              renderSettingItem(
                item,
                itemIndex,
                itemIndex === section.items.length - 1
              )
            )}
          </Card>
        ))}

        {/* Logout Button */}
        <Card style={[styles.section, styles.logoutSection]}>
          <Pressable style={styles.logoutButton} onPress={() => signOut()}>
            <LogOut size={20} color={theme.colors.error} />
            <Typography
              variant="md"
              style={{ color: theme.colors.error, marginLeft: 12 }}
            >
              Log Out
            </Typography>
          </Pressable>
        </Card>

        <Typography
          variant="sm"
          style={[styles.appInfo, { color: theme.colors.gray[500] }]}
        >
          Trip Mingle Partner v1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    marginRight: 12,
  },
  logoutSection: {
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  appInfo: {
    textAlign: "center",
    marginVertical: 24,
  },
});
