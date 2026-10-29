// The one back button used on every screen with its own header (details,
// resolve, create), so they all look and behave the same.
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

type BackButtonProps = {
  // Optional override; by default it goes back in the navigation history
  onPress?: () => void;
};

// On web, a screen opened straight from a URL has no history to go back to,
// so fall back to the challenge list instead of doing nothing
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export default function BackButton({ onPress = goBack }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
    >
      <ChevronLeft size={22} color="#17181A" />
    </Pressable>
  );
}
