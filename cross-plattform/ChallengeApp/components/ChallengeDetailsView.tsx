// What the details screen shows, given a challenge and the user's saved progress.
// Kept separate from the screen (which loads data and navigates) so the layout
// can be reused and previewed without Firebase.
import { getStatus } from "@/api/progressApi";
import StatusBadge from "@/components/StatusBadge";
import { ChallengeData, ChallengeProgress } from "@/utils/challengeData";
import {
    countSavedSteps,
    getSavedStepStatus,
    TOTAL_STEPS,
} from "@/utils/challengeRules";
import { Check, ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChallengeDetailsViewProps = {
  challenge: ChallengeData;
  progress: ChallengeProgress | null;
  onBack: () => void;
  onStart: () => void;
};

// "easy" → "Easy"
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ChallengeDetailsView({
  challenge,
  progress,
  onBack,
  onStart,
}: ChallengeDetailsViewProps) {
  const status = getStatus(progress);
  const steps = getSavedStepStatus(progress, challenge.answer);
  const stepsDone = countSavedSteps(progress, challenge.answer);
  const isCompleted = status === "completed";

  const buttonLabel = isCompleted
    ? "Completed ✓"
    : status === "in_progress"
      ? "Continue challenge"
      : "Start challenge";

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-6"
      >
        {/* Round back button — the map will sit behind it later */}
        <Pressable
          onPress={onBack}
          className="mt-2 h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color="#17181A" />
        </Pressable>

        {/* Status + tags */}
        <View className="flex-row flex-wrap gap-2">
          <StatusBadge
            status={status}
            detail={
              status === "in_progress"
                ? `${stepsDone} of ${TOTAL_STEPS}`
                : undefined
            }
          />
          {challenge.difficulty && (
            <Tag>{capitalize(challenge.difficulty)}</Tag>
          )}
          {challenge.category && <Tag>{challenge.category}</Tag>}
        </View>

        <View className="gap-2">
          <Text className="font-display text-[32px] leading-10 text-ink">
            {challenge.title}
          </Text>
          <Text className="font-body text-[17px] leading-6 text-muted">
            {challenge.description}
          </Text>
          <Text className="font-body text-sm text-muted">
            Created by {challenge.authorName}
          </Text>
        </View>

        {/* Two key numbers side by side */}
        <View className="flex-row gap-3">
          <StatCard
            label="Must be within"
            value={`${challenge.radiusMeters} m`}
          />
          <StatCard
            label="Difficulty"
            value={
              challenge.difficulty ? capitalize(challenge.difficulty) : "—"
            }
          />
        </View>

        {/* The three requirements, ticked from the saved progress */}
        <View className="gap-3 rounded-card bg-surface p-4">
          <Text className="font-body-semibold text-sm text-ink">
            To complete
          </Text>
          <Requirement number={1} done={steps.location}>
            Be at the location
          </Requirement>
          <Requirement number={2} done={steps.photo}>
            Add a photo as proof
          </Requirement>
          <Requirement number={3} done={steps.answer}>
            <Text className="font-body-semibold">Answer: </Text>
            {challenge.question}
          </Requirement>
        </View>

        <Text className="font-mono text-xs text-muted">
          {challenge.target.latitude.toFixed(5)},{" "}
          {challenge.target.longitude.toFixed(5)}
        </Text>
      </ScrollView>

      {/* Primary action pinned to the bottom, always reachable with the thumb */}
      <View className="border-t border-line bg-paper px-5 pb-2 pt-3">
        <Pressable
          className={`h-[54px] items-center justify-center rounded-button ${
            isCompleted ? "bg-line" : "bg-ink active:opacity-80"
          }`}
          disabled={isCompleted}
          onPress={onStart}
        >
          <Text
            className={`font-body-semibold text-base ${isCompleted ? "text-muted" : "text-surface"}`}
          >
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Outlined pill for difficulty / category
function Tag({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-full border border-line px-2.5 py-1">
      <Text className="font-body-medium text-xs text-muted">{children}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-input bg-surface px-4 py-3">
      <Text className="font-body text-xs text-muted">{label}</Text>
      <Text className="font-display text-xl text-ink">{value}</Text>
    </View>
  );
}

// One line in the checklist: green circle with a tick when done, numbered ring otherwise
function Requirement({
  number,
  done,
  children,
}: {
  number: number;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${
          done ? "bg-status-done-ink" : "border-2 border-line"
        }`}
      >
        {done ? (
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        ) : (
          <Text className="font-body-semibold text-sm text-muted">
            {number}
          </Text>
        )}
      </View>
      <Text className="flex-1 font-body text-base text-ink">{children}</Text>
    </View>
  );
}
