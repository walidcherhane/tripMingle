import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Language = {
  id: string;
  name: string;
  code: string;
};

const languages: Language[] = [
  { id: "en", name: "English", code: "en" },
  { id: "fr", name: "French", code: "fr" },
  { id: "es", name: "Spanish", code: "es" },
  { id: "de", name: "German", code: "de" },
  { id: "it", name: "Italian", code: "it" },
  { id: "pt", name: "Portuguese", code: "pt" },
  { id: "ar", name: "Arabic", code: "ar" },
  { id: "zh", name: "Chinese", code: "zh" },
  { id: "ja", name: "Japanese", code: "ja" },
  { id: "ko", name: "Korean", code: "ko" },
];

export default function LanguageScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
    // In a real app, this would update the user's language preference
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Typography variant="lg" weight="semibold">
            App Language
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500], marginTop: 4 }}
          >
            Select your preferred language
          </Typography>
        </View>

        {languages.map((language) => (
          <Pressable
            key={language.id}
            style={({ pressed }) => [
              styles.languageItem,
              pressed && styles.pressed,
            ]}
            onPress={() => handleLanguageSelect(language.id)}
          >
            <Typography variant="md">{language.name}</Typography>
            {selectedLanguage === language.id && (
              <Check size={20} color={theme.colors.primary.brand} />
            )}
          </Pressable>
        ))}
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
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
});
