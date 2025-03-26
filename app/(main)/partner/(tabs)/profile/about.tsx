import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  StyleProp,
  ViewStyle,
  TextStyle,
  Image,
  Pressable,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import type { ThemeContextValue } from "@/types/theme";
import {
  Mail,
  Phone,
  Globe,
  Shield,
  FileText,
  ChevronRight,
  Github,
  Twitter,
} from "lucide-react-native";
import { theme } from "@/theme";
import { Stack } from "expo-router";

const APP_VERSION = "1.0.0";

interface LinkItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  url: string;
}

const AboutScreen: React.FC = () => {
  const theme: ThemeContextValue = useTheme();

  const links: LinkItem[] = [
    {
      icon: Globe,
      title: "Website",
      subtitle: "Visit our official website",
      url: "https://tripmingle.com",
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      subtitle: "Learn how we protect your data",
      url: "https://tripmingle.com/privacy",
    },
    {
      icon: FileText,
      title: "Terms of Service",
      subtitle: "Read our terms and conditions",
      url: "https://tripmingle.com/terms",
    },
  ];

  const handleOpenUrl = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch (error) {
      console.error(`Error opening URL: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: "About us",
        }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Typography variant="lg" weight="bold">
            TripMingle
          </Typography>
          <Typography style={styles.description}>
            Making travel connections simpler and more reliable than ever
            before.
          </Typography>
        </View>

        <View style={styles.featureCard}>
          <Typography variant="md" weight="semibold" color="primary.brand">
            Contact Support
          </Typography>
          <View style={{ marginTop: theme.spacing.md }}>
            <View style={styles.contactItem}>
              <Mail size={20} color={theme.colors.primary.brand} />
              <Typography style={{ marginLeft: theme.spacing.sm }}>
                support@tripmingle.com
              </Typography>
            </View>
            <View style={styles.contactItem}>
              <Phone size={20} color={theme.colors.primary.brand} />
              <Typography style={{ marginLeft: theme.spacing.sm }}>
                +1 (555) 123-4567
              </Typography>
            </View>
          </View>
        </View>

        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Pressable
              key={index}
              style={styles.linkItem}
              onPress={() => handleOpenUrl(link.url)}
            >
              <View style={styles.iconContainer}>
                <Icon size={20} color={theme.colors.primary.brand} />
              </View>
              <View style={styles.linkContent}>
                <Typography weight="semibold">{link.title}</Typography>
                <Typography style={styles.linkText}>{link.subtitle}</Typography>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </Pressable>
          );
        })}

        <View style={styles.socialSection}>
          <Pressable
            style={styles.socialButton}
            onPress={() => handleOpenUrl("https://github.com/tripmingle")}
          >
            <Github size={24} color={theme.colors.gray[700]} />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => handleOpenUrl("https://twitter.com/tripmingle")}
          >
            <Twitter size={24} color={theme.colors.gray[700]} />
          </Pressable>
        </View>

        <Typography style={styles.version}>Version {APP_VERSION}</Typography>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary.brand,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  logoImage: {
    width: 60,
    height: 60,
    tintColor: theme.colors.primary.lightest,
  },
  description: {
    textAlign: "center",
    color: theme.colors.gray[600],
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  featureCard: {
    backgroundColor: theme.colors.primary.brand + "10",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  linkItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linkContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.sizes.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.brand + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  socialSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  version: {
    textAlign: "center",
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xl,
  },
});
export default AboutScreen;
