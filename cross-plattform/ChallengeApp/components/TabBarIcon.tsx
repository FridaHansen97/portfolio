// Icon for the bottom tab bar, using the same icon set as the rest of the app.
// React Navigation passes `color` as ColorValue (string | number | null | object),
// but lucide only accepts a string. Instead of casting, we check the type at
// runtime and fall back to the ink color.
import { LucideIcon } from "lucide-react-native";
import { ColorValue } from "react-native";

type TabBarIconProps = {
  icon: LucideIcon;
  color: ColorValue;
};

export default function TabBarIcon({ icon: Icon, color }: TabBarIconProps) {
  return (
    <Icon
      size={24}
      color={typeof color === "string" ? color : "#17181A"}
      strokeWidth={1.75}
    />
  );
}
