// components/ChallengeCard.tsx
// One challenge in the overview list: title, short description, the
// signed-in user's status, and a progress bar while it is in progress.
// Pressing it calls onPress (navigation is decided by the screen, so the
// card stays reusable).
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import { ChallengeData, ProgressStatus } from "@/utils/challengeData";
import { TOTAL_STEPS } from "@/utils/challengeRules";
import { Pressable, Text, View } from "react-native";

type ChallengeCardProps = {
  challenge: ChallengeData;
  status: ProgressStatus;
  stepsDone: number;
  onPress?: () => void;
};

export default function ChallengeCard({
  challenge,
  status,
  stepsDone,
  onPress,
}: ChallengeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 gap-2 rounded-xl bg-white p-4 shadow-sm active:opacity-70"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-lg font-bold">{challenge.title}</Text>
        <StatusBadge status={status} />
      </View>

      {/* numberOfLines keeps cards the same height even with long descriptions */}
      <Text className="text-gray-600" numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Only in progress: not started is always 0 and completed is always 100 */}
      {status === "in_progress" && (
        <ProgressBar
          completed={stepsDone}
          total={TOTAL_STEPS}
          label="requirements"
        />
      )}

      <Text className="text-xs text-gray-400">
        By {challenge.authorName} · radius {challenge.radiusMeters} m
      </Text>
    </Pressable>
  );
}
