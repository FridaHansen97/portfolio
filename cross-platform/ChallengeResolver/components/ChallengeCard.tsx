// One challenge in the list: status, title, description, progress while in progress, and a meta line (difficulty, category, author). The card stays reusable since the screen decides what happens onPress.
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import { ChallengeData, ProgressStatus } from "@/utils/challengeData";
import { TOTAL_STEPS } from "@/utils/challengeRules";
import { capitalize } from "@/utils/formatUtils";
import { Pressable, Text } from "react-native";

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
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

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
