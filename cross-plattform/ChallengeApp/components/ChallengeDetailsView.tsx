// What the details screen shows, given a challenge and the user's saved progress.
// Kept separate from the screen (which loads data and navigates) so the layout
// can be reused and previewed without Firebase.
import { getStatus } from "@/api/progressApi";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import { ChallengeData, ChallengeProgress } from "@/utils/challengeData";
import {
  countSavedSteps,
  getSavedStepStatus,
  TOTAL_STEPS,
} from "@/utils/challengeRules";
import { Check, Pencil, Trash } from "lucide-react-native";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChallengeDetailsViewProps = {
  challenge: ChallengeData;
  progress: ChallengeProgress | null;
  onBack: () => void;
  onStart: () => void;
  // Only the author gets edit/delete
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  deleteError?: string | null;
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
  isOwner,
  onEdit,
  onDelete,
  isDeleting,
  deleteError,
}: ChallengeDetailsViewProps) {
  // Deleting can't be undone, so the first tap only asks for confirmation.
  // Shown on the screen instead of Alert.alert, which does nothing on web.
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
        {/* Round buttons on top: back, plus edit/delete for the author.
            The map will sit behind them later. */}
        <View className="mt-2 flex-row items-center justify-between">
          <BackButton onPress={onBack} />
          {isOwner && (
            <View className="flex-row gap-2">
              <RoundIconButton label="Edit challenge" onPress={onEdit}>
                <Pencil size={18} color="#17181A" />
              </RoundIconButton>
              <RoundIconButton
                label="Delete challenge"
                onPress={() => setConfirmingDelete(true)}
              >
                <Trash size={18} color="#7A2508" />
              </RoundIconButton>
            </View>
          )}
        </View>

        {confirmingDelete && (
          <View
            className="gap-3 rounded-card bg-danger p-4"
            accessibilityRole="alert"
          >
            <Text className="font-body-semibold text-base text-danger-ink">
              Delete this challenge?
            </Text>
            <Text className="font-body text-sm text-danger-ink">
              It will be removed for everyone. This can't be undone.
            </Text>
            {deleteError && (
              <Text className="font-body text-sm text-danger-ink">
                {deleteError}
              </Text>
            )}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="h-11 flex-1 items-center justify-center rounded-button border border-danger-ink/30 bg-surface active:opacity-70"
              >
                <Text className="font-body-semibold text-sm text-ink">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={onDelete}
                disabled={isDeleting}
                className="h-11 flex-1 items-center justify-center rounded-button bg-danger-ink active:opacity-80"
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-body-semibold text-sm text-surface">
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

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
            Created by {isOwner ? "you" : challenge.authorName}
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

// Round button in the same style as BackButton, for edit and delete
function RoundIconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      {children}
    </Pressable>
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
