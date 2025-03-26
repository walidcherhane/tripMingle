import { View } from "react-native";
import React, { useEffect } from "react";
import { Stack, router, usePathname } from "expo-router";
import { BookingProvider } from "@/context/BookingContext";

const ClientLayout = () => {
  const pathname = usePathname();

  // Redirect to tabs when accessing the root client path
  useEffect(() => {
    if (pathname === "/client") {
      router.replace("/(main)/client/(tabs)");
    }
  }, [pathname]);

  return (
    <BookingProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen
          name="registration"
          options={{ headerTitle: "Registration" }}
        />
      </Stack>
    </BookingProvider>
  );
};

export default ClientLayout;
