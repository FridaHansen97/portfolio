// The back button is used on every screen with its own header, so they they all look and behave the same.
import RoundIconButton from "@/components/RoundIconButton";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

type BackButtonProps = {
  onPress?: () => void;
};

// On web, a screen opened straight from a URL has no history to go back to, so fall back to home/ challenge list instead of doing nothing.
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export default function BackButton({ onPress = goBack }: BackButtonProps) {
  return (
    <RoundIconButton label="Go back" onPress={onPress}>
      <ChevronLeft size={22} color="#17181A" />
    </RoundIconButton>
  );
}
