// Route guard: every screen inside (protected) requires a signed-in user.
// Logged-out users are redirected to /auth before any protected screen renders.
import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  // On startup Firebase needs a moment to restore a saved session.
  // Without this check, a logged-in user would be sent to /auth for a split second.
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack>
      {/* The tab bar has its own headers, so hide the Stack header for it */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Screens pushed on top of the tabs get a back button automatically */}
      <Stack.Screen
        name="challenge/[id]"
        options={{ title: "Challenge", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="resolve/[id]"
        options={{ title: "Resolve", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="createChallenge"
        options={{ title: "New challenge", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}
