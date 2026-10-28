// Bottom tab bar for the main screens.
// Auth is already handled by the parent (protected)/_layout.tsx.
import TabBarIcon from "@/components/TabBarIcon";
import { router, Tabs } from "expo-router";
import { Pressable, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) => <TabBarIcon name="flag" color={color} />,
          // "+ New" in the header opens the create screen (requirement 1)
          headerRight: () => (
            <Pressable
              className="mr-4 rounded-lg bg-blue-500 px-3 py-1.5"
              onPress={() => router.push("/createChallenge")}
            >
              <Text className="font-semibold text-white">+ New</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="profilePage"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
