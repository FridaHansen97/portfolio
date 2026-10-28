// components/ChallengeCard.tsx
// One challenge in the overview list: status, title, short description,
// progress while in progress, and a meta line (difficulty · category · author).
// Pressing it calls onPress — navigation is decided by the screen, so the
// card stays reusable.
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import { ChallengeData, ProgressStatus } from "@/utils/challengeData";
import { TOTAL_STEPS } from "@/utils/challengeRules";
import { Pressable, Text } from "react-native";

type ChallengeCardProps = {
  challenge: ChallengeData;
  status: ProgressStatus;
  stepsDone: number;
  onPress?: () => void;
};

// "easy" → "Easy"
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ChallengeCard({
  challenge,
  status,
  stepsDone,
  onPress,
}: ChallengeCardProps) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  // Only include the parts that exist, then join with " · "
  const meta = [
    challenge.difficulty && capitalize(challenge.difficulty),
    challenge.category,
    `by ${challenge.authorName}`,
    isInProgress && `${stepsDone} of ${TOTAL_STEPS} steps`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onPress}
      // Completed challenges fade back so open ones stand out
      className={`mb-3 gap-2 rounded-card p-4 active:opacity-70 ${
        isCompleted ? "bg-surface/60" : "bg-surface"
      }`}
    >
      <StatusBadge status={status} />

      <Text
        className={`font-display text-xl ${isCompleted ? "text-muted" : "text-ink"}`}
      >
        {challenge.title}
      </Text>

      {/* Completed cards skip the description to keep the list compact */}
      {!isCompleted && (
        <Text
          className="font-body text-[15px] leading-5 text-muted"
          numberOfLines={2}
        >
          {challenge.description}
        </Text>
      )}

      {isInProgress && (
        <ProgressBar completed={stepsDone} total={TOTAL_STEPS} />
      )}

      <Text className="font-body text-xs text-muted">{meta}</Text>
    </Pressable>
  );
}
