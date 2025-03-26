// app/(main)/partner/profile/support.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { Stack } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Phone, Mail, MessageSquare, AlertTriangle } from "lucide-react-native";

export default function SupportScreen() {
  const theme = useTheme();

  const handlePhoneCall = () => {
    Linking.openURL("tel:+212500000000");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@yourdomain.com");
  };

  const handleWhatsApp = () => {
    Linking.openURL("whatsapp://send?phone=+212500000000");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Help & Support",
        }}
      />

      <ScrollView style={styles.container}>
        {/* Emergency Support */}
        <Card style={[styles.section, styles.emergencyCard]}>
          <View style={styles.emergencyContent}>
            <AlertTriangle size={24} color={theme.colors.error} />
            <Typography
              variant="lg"
              weight="semibold"
              style={{ color: theme.colors.error, marginTop: 8 }}
            >
              Emergency Support
            </Typography>
            <Typography
              variant="sm"
              style={{
                color: theme.colors.gray[600],
                marginTop: 8,
                textAlign: "center",
              }}
            >
              For immediate assistance during trips
            </Typography>
            <Button
              title="Call Emergency Support"
              variant="secondary"
              leftIcon={<Phone size={18} />}
              onPress={handlePhoneCall}
              style={styles.emergencyButton}
            />
          </View>
        </Card>

        {/* Contact Options */}
        <Card style={styles.section}>
          <Typography
            variant="lg"
            weight="semibold"
            style={styles.sectionTitle}
          >
            Contact Us
          </Typography>

          <View style={styles.contactOptions}>
            <Button
              title="Call Support"
              variant="secondary"
              leftIcon={<Phone size={18} />}
              onPress={handlePhoneCall}
              style={styles.contactButton}
            />

            <Button
              title="Send Email"
              variant="secondary"
              leftIcon={<Mail size={18} />}
              onPress={handleEmail}
              style={styles.contactButton}
            />

            <Button
              title="WhatsApp"
              variant="secondary"
              leftIcon={<MessageSquare size={18} />}
              onPress={handleWhatsApp}
              style={styles.contactButton}
            />
          </View>
        </Card>

        {/* Support Hours */}
        <Card style={styles.section}>
          <Typography
            variant="md"
            weight="semibold"
            style={styles.sectionTitle}
          >
            Support Hours
          </Typography>
          <View style={styles.hoursContainer}>
            <View style={styles.hoursRow}>
              <Typography variant="sm">Regular Support</Typography>
              <Typography
                variant="sm"
                weight="medium"
                style={{ color: theme.colors.gray[600] }}
              >
                8:00 AM - 10:00 PM
              </Typography>
            </View>
            <View style={styles.hoursRow}>
              <Typography variant="sm">Emergency Support</Typography>
              <Typography
                variant="sm"
                weight="medium"
                style={{ color: theme.colors.gray[600] }}
              >
                24/7
              </Typography>
            </View>
          </View>
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
  section: {
    margin: 16,
    marginBottom: 0,
  },
  emergencyCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  emergencyContent: {
    alignItems: "center",
  },
  emergencyButton: {
    marginTop: 16,
    width: "100%",
  },
  sectionTitle: {
    marginBottom: 16,
  },
  contactOptions: {
    gap: 12,
  },
  contactButton: {
    width: "100%",
  },
  hoursContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
});
