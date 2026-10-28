// components/ProgressBar.tsx
// Segmented progress bar: one segment per requirement, filled from the left.
// Segments (instead of one continuous bar) make "2 of 3" readable at a glance.
// Same color everywhere, so progress always looks the same in the app.
// Generic on purpose — it only knows numbers, so it can be reused anywhere.
import { Text, View } from "react-native";

type ProgressBarProps = {
  completed: number;
  total: number;
  // Optional "x of y …" text under the bar
  label?: string;
};

export default function ProgressBar({
  completed,
  total,
  label,
}: ProgressBarProps) {
  // Clamp so bad input (e.g. 4 of 3) never draws more segments than exist
  const filled = Math.min(Math.max(completed, 0), total);

  return (
    <View className="gap-1.5">
      <View className="flex-row gap-1">
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < filled ? "bg-status-done-ink" : "bg-line"}`}
          />
        ))}
      </View>
      {label && (
        <Text className="font-body text-xs text-muted">
          {filled} of {total} {label}
        </Text>
      )}
    </View>
  );
}
