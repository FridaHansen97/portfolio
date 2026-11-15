// Bottom tab bar for the main screens.
import TabBarIcon from "@/components/TabBarIcon";
import { Tabs } from "expo-router";
import { Flag, MapIcon, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
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
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon icon={Flag} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapScreen"
        options={{
          title: "Map",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={MapIcon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profilePage"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon icon={User} color={color} />,
        }}
      />
    </Tabs>
  );
}
