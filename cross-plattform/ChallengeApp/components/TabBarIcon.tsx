// Reusable icon for the bottom tab bar.
// React Navigation passes `color` as ColorValue (string | number | null | object),
// but @expo/vector-icons only accepts a string. Instead of casting, we check the
// type at runtime: a real color string is passed through, anything else falls
// back to the icon's default color.
import AntDesign from "@expo/vector-icons/AntDesign";
import { ComponentProps } from "react";
import { ColorValue } from "react-native";

type TabBarIconProps = {
  // Only valid AntDesign icon names are allowed — a typo becomes a compile error
  name: ComponentProps<typeof AntDesign>["name"];
  color: ColorValue;
};

export default function TabBarIcon({ name, color }: TabBarIconProps) {
  return (
    <AntDesign
      name={name}
      size={24}
      color={typeof color === "string" ? color : undefined}
    />
  );
}
