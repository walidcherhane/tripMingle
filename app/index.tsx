import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { routeUser, UserProfile } from "@/utils/routingUtils";
import { usePathname } from "expo-router";
import { Typography } from "@/components/ui/typography";

export default function Home() {
  // Get the current path
  const pathname = usePathname();

  // Try to get the current user with registration status
  const currentUser = useQuery(api.auth.getMe);
  console.log("🚀 ~ Home ~ currentUser:", currentUser);

  useEffect(() => {
    routeUser(currentUser, pathname);
  }, [currentUser, pathname]);

  // If we're still here, show a generic message
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Typography>Redirecting you to the right place...</Typography>
    </View>
  );
}
