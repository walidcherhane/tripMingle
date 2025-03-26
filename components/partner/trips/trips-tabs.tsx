import Tabs from "@/components/ui/tabs";
import React from "react";

export type TabType = "upcoming" | "history" | "all";

interface TripTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TripTabs = ({ activeTab, onTabChange }: TripTabsProps) => {
  return (
    <Tabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={[
        { value: "all", label: "All" },
        { value: "upcoming", label: "Upcoming" },
        { value: "history", label: "History" },
      ]}
    />
  );
};
