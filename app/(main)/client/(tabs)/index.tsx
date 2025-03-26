import React from "react";
import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/client/dashboard/home-header";
import { SearchBar } from "@/components/client/dashboard/search-bar";
import { FeaturedVehicles } from "@/components/client/dashboard/featured-vehicles";
import { ActiveDrivers } from "@/components/client/dashboard/active-drivers";
import { QuickBooking } from "@/components/client/dashboard/quick-booking";
import { colors } from "@/theme/colors";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ClientHomeScreen() {
  const currentUser = useQuery(api.auth.getMe);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeHeader />

          <View>
            <SearchBar />

            <QuickBooking />
            <ActiveDrivers />
            <FeaturedVehicles />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
