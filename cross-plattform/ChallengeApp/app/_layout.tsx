// app/_layout.tsx
// Root layout: loads the fonts and wraps the whole app in the providers every
// screen needs. No auth logic here — the route guard lives in
// app/(protected)/_layout.tsx.
import "../global.css"; // NativeWind styles — must be imported once, at the top of the app

import { AuthProvider } from "@/context/AuthContext";
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

// Keep the splash screen up until the fonts are ready, so text never
// flashes in the system font first
SplashScreen.preventAutoHideAsync();

// One shared cache for all React Query calls. Created outside the component
// so it is not re-created on every render.
const queryClient = new QueryClient();

export default function RootLayout() {
  // The keys become the font family names used in tailwind.config.js
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    // Hide the splash also on error — the app still works with system fonts
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          {/* Signed-in part of the app — the group's own layout checks auth */}
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          {/* Public screens — must stay outside (protected) or logged-out users could never reach them */}
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="redirect" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
