// Profile: shows who is signed in and lets the user sign out.
// Progress/score will be added here later.
import { signOutUser } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-gray-50 p-6">
      <Text className="text-2xl font-bold">
        {user?.displayName ?? "No name"}
      </Text>
      <Text className="mb-6 text-gray-500">{user?.email}</Text>

      {/* No navigation needed after sign-out: the guard in (protected)/_layout.tsx
          sees user === null and redirects to /auth automatically */}
      <TouchableOpacity
        className="rounded-lg bg-red-500 px-6 py-3"
        onPress={signOutUser}
      >
        <Text className="font-semibold text-white">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
