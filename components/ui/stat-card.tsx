// components/ui/stat-card.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "./typography";
import { Card } from "./card";
import { useTheme } from "@/hooks/useTheme";
import { LucideIcon } from "lucide-react-native";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.primary.lightest,
              borderRadius: theme.borderRadius.sm,
              padding: theme.getSpacing("sm"),
            },
          ]}
        >
          <Icon size={20} color={theme.colors.primary.brand} />
        </View>
        {trend && (
          <View
            style={[
              styles.trendContainer,
              {
                backgroundColor: trend.isPositive
                  ? theme.colors.success
                  : theme.colors.error,
                borderRadius: theme.borderRadius.full,
                paddingHorizontal: theme.getSpacing("sm"),
                paddingVertical: theme.getSpacing("xs"),
              },
            ]}
          >
            <Typography
              variant="sm"
              weight="medium"
              style={{
                color: theme.colors.background,
              }}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </Typography>
          </View>
        )}
      </View>

      <Typography
        variant="2xl"
        weight="bold"
        style={StyleSheet.flatten([styles.value, { color: theme.colors.text }])}
      >
        {value}
      </Typography>

      <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
        {title}
      </Typography>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    marginBottom: 4,
  },
});
