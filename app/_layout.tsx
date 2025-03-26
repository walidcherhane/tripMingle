import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/context/ThemeContext";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationProvider } from "@/context/LocationContext";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ConvexReactClient } from "convex/react";
import { AuthRoutingProvider } from "@/context/AuthRoutingProvider";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const unstable_settings = {
  initialRouteName: "onboarding/index",
};

// Keep the splash screen visible until everything is ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Raleway: require("@/assets/fonts/Raleway-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded or there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider
        client={convex}
        storage={Platform.OS !== "web" ? secureStorage : undefined}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LocationProvider>
              <RegistrationProvider>
                <BottomSheetModalProvider>
                  <AuthRoutingProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}
                    >
                      <Stack.Screen
                        name="onboarding"
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="(main)"
                        options={{
                          headerShown: false,
                        }}
                      />
                    </Stack>
                  </AuthRoutingProvider>
                </BottomSheetModalProvider>
              </RegistrationProvider>
            </LocationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}
