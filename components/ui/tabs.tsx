import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";

interface TabsProps<TabType extends string> {
  tabs: {
    value: TabType;
    label: string;
  }[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Tabs = <TabKey extends string>({
  activeTab,
  onTabChange,
  tabs,
}: TabsProps<TabKey>) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          style={[styles.tab, activeTab === tab.value && styles.activeTab]}
          onPress={() => onTabChange(tab.value)}
        >
          <Typography
            variant="md"
            weight={activeTab === tab.value ? "semibold" : "normal"}
            style={StyleSheet.flatten([
              styles.tabText,
              activeTab === tab.value && { color: theme.colors.primary.brand },
            ])}
          >
            {tab.label}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    color: "#6B7280",
  },
});

export default Tabs;
