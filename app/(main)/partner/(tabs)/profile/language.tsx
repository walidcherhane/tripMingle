// app/(main)/partner/profile/language.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { Check } from "lucide-react-native";

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
}

const languages: Language[] = [
  {
    id: "1",
    name: "English",
    nativeName: "English",
    code: "en",
  },
  {
    id: "2",
    name: "French",
    nativeName: "Français",
    code: "fr",
  },
  {
    id: "3",
    name: "Arabic",
    nativeName: "العربية",
    code: "ar",
  },
  {
    id: "4",
    name: "Spanish",
    nativeName: "Español",
    code: "es",
  },
];

export default function LanguageScreen() {
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    // Here you would implement the actual language change
    // using your i18n system
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Language",
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            Select your preferred language
          </Typography>
        </View>

        <Card style={styles.languageCard}>
          {languages.map((language, index) => (
            <Pressable
              key={language.id}
              style={[
                styles.languageItem,
                index < languages.length - 1 && styles.itemBorder,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageInfo}>
                <Typography variant="md" weight="medium">
                  {language.name}
                </Typography>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500] }}
                >
                  {language.nativeName}
                </Typography>
              </View>

              {selectedLanguage === language.code && (
                <View
                  style={[
                    styles.selectedIndicator,
                    { backgroundColor: theme.colors.primary.brand },
                  ]}
                >
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          ))}
        </Card>

        <Typography
          variant="sm"
          style={{ ...styles.note, color: theme.colors.gray[500] }}
        >
          The app will automatically restart to apply language changes
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
  header: {
    padding: 16,
  },
  languageCard: {
    margin: 16,
    marginTop: 0,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  languageInfo: {
    flex: 1,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  note: {
    margin: 16,
    textAlign: "center",
  },
});
