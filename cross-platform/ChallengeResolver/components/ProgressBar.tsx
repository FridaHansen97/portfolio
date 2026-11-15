// The progress bar: one segment per requirement, filled from the left. Segments instead of a percent lets the user see exactly how much they have left,
// and since there are so few requirements, this makes a lot of sense. The same color everywhere so progress always looks the same in the app. Reusable.
import { Text, View } from "react-native";

type ProgressBarProps = {
  completed: number;
  total: number;
  label?: string;
};

export default function ProgressBar({
  completed,
  total,
  label,
}: ProgressBarProps) {
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
