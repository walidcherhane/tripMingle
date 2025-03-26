import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronRight,
} from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const supportOptions = [
  {
    id: "chat",
    title: "Chat with Support",
    description: "Start a conversation with our support team",
    icon: MessageCircle,
    action: "chat",
  },
  {
    id: "call",
    title: "Call Support",
    description: "Call our support hotline",
    icon: Phone,
    action: "tel:+1234567890",
  },
  {
    id: "email",
    title: "Email Support",
    description: "Send us an email",
    icon: Mail,
    action: "mailto:support@tripmingle.com",
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Browse frequently asked questions",
    icon: HelpCircle,
    action: "faq",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    description: "Read our terms and conditions",
    icon: FileText,
    action: "terms",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "Read our privacy policy",
    icon: FileText,
    action: "privacy",
  },
];

export default function SupportScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);

  const handleSupportOption = (action: string) => {
    if (action.startsWith("tel:") || action.startsWith("mailto:")) {
      Linking.openURL(action).catch(() => {
        Alert.alert("Error", "Could not open the link");
      });
    } else if (action === "chat") {
      Alert.alert(
        "Chat Support",
        "This feature is coming soon. Please use email or phone support for now."
      );
    } else if (action === "faq") {
      Alert.alert(
        "FAQ",
        "This feature is coming soon. Please use email or phone support for now."
      );
    } else if (action === "terms") {
      Alert.alert(
        "Terms & Conditions",
        "This feature is coming soon. Please use email or phone support for now."
      );
    } else if (action === "privacy") {
      Alert.alert(
        "Privacy Policy",
        "This feature is coming soon. Please use email or phone support for now."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Typography variant="lg" weight="semibold">
            Help & Support
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500], marginTop: 4 }}
          >
            How can we help you today?
          </Typography>
        </View>

        {supportOptions.map((option) => (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              styles.supportItem,
              pressed && styles.pressed,
            ]}
            onPress={() => handleSupportOption(option.action)}
          >
            <View style={styles.supportItemContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary.lightest },
                ]}
              >
                <option.icon size={20} color={theme.colors.primary.brand} />
              </View>
              <View style={styles.supportItemText}>
                <Typography variant="md" weight="medium">
                  {option.title}
                </Typography>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500], marginTop: 2 }}
                >
                  {option.description}
                </Typography>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </View>
          </Pressable>
        ))}
      </Card>

      <Card style={styles.contactCard}>
        <Typography variant="md" weight="semibold">
          Contact Information
        </Typography>
        <Typography
          variant="sm"
          style={{
            color: theme.colors.gray[500],
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          Our support team is available 24/7
        </Typography>

        <View style={styles.contactInfo}>
          <Typography variant="sm" weight="medium">
            Email:
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.primary.brand }}
            onPress={() => Linking.openURL("mailto:support@tripmingle.com")}
          >
            support@tripmingle.com
          </Typography>
        </View>

        <View style={styles.contactInfo}>
          <Typography variant="sm" weight="medium">
            Phone:
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.primary.brand }}
            onPress={() => Linking.openURL("tel:+1234567890")}
          >
            +1 (234) 567-890
          </Typography>
        </View>
      </Card>
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
  supportItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  supportItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supportItemText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  contactCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
});
