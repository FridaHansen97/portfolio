// Bottom tab bar for the main screens.
// Auth is already handled by the parent (protected)/_layout.tsx.
import TabBarIcon from "@/components/TabBarIcon";
import { Tabs } from "expo-router";
import { Flag, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Colors from the design tokens (ink / muted / surface / line)
        tabBarActiveTintColor: "#17181A",
        tabBarInactiveTintColor: "#55585E",
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#D6D2C7" },
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Challenges",
          // The screen draws its own large header (title, count, + button)
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon icon={Flag} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profilePage"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon icon={User} color={color} />,
        }}
      />
    </Tabs>
  );
}
