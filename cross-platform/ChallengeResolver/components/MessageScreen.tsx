// A screen for the moments before the real content - loading, error, "no longer exists", "already completed". Always has a back button, since these screens hide the stack header.
import BackButton from "@/components/BackButton";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Used by the details and resolve screens.
type MessageScreenProps = {
  loading?: boolean;
  message?: string;
  tone?: "muted" | "error" | "success";
  onRetry?: () => void;
};

// Written out in full so NativeWind can find the class names.
const TONE_CLASSES = {
  muted: "font-body text-muted",
  error: "font-body text-danger-ink",
  success: "font-display text-xl text-status-done-ink",
};

export default function MessageScreen({
  loading = false,
  message,
  tone = "muted",
  onRetry,
}: MessageScreenProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      <View className="px-5 pt-2">
        <BackButton />
      </View>

      <View className="flex-1 items-center justify-center gap-3 p-6">
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text className={`text-center ${TONE_CLASSES[tone]}`}>{message}</Text>
        )}

        {onRetry && (
          <Pressable
            className="rounded-button bg-ink px-5 py-3 active:opacity-80"
            onPress={onRetry}
          >
            <Text className="font-body-semibold text-surface">Try again</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
