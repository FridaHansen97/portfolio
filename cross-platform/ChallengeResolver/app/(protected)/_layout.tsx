// Route guard: every screen inside the (protected) folder requires a signed-in user. Logged-out users are redirected to /auth before any protected screen renders.
import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <Stack.Screen
        name="editChallenge/[id]"
        options={{ headerShown: false, title: "Edit challenge" }}
      />
    </Stack>
  );
}
