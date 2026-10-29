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

      {/* These screens draw their own header with BackButton, so the Stack header
          is hidden. title is still used for the browser tab on web. */}
      <Stack.Screen
        name="challenge/[id]"
        options={{ headerShown: false, title: "Challenge" }}
      />
      <Stack.Screen
        name="resolve/[id]"
        options={{ headerShown: false, title: "Resolve" }}
      />
      <Stack.Screen
        name="createChallenge"
        options={{ headerShown: false, title: "New challenge" }}
      />
    </Stack>
  );
}
