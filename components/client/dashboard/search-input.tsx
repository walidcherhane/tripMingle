import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MapPin } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
}

export const SearchInput = ({
  placeholder,
  value,
  onChangeText,
  onPress,
}: SearchInputProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={20} color={colors.primary.brand} />
      </View>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={colors.gray[400]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
});
