// Round white button with an icon in it. Every round button in the app such as (back, edit, delete, zoom buttons on map) uses this, so they always look and behave the same.
import { ReactNode } from "react";
import { Pressable } from "react-native";

type RoundIconButtonProps = {
  label: string;
  onPress: () => void;
  children: ReactNode;
  className?: string;
};

export default function RoundIconButton({
  label,
  onPress,
  children,
  className = "",
}: RoundIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Found out about this the other day - makes the tap area 8 px bigger on each side of the visible circle.
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
}
