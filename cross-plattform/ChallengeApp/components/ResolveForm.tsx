// The Resolve form (requirement 3). The user must:
//   1. verify their location (GPS or mock)
//   2. add at least one photo
//   3. answer the question correctly ("Check answer")
// "Save & exit" stores an unfinished attempt so the user can continue later.
// "Complete" only works when all three are done; photos are uploaded to
// Firebase Storage and the result is saved to the user's own progress.
//
// Rendered by app/(protected)/resolve/[id].tsx only once the challenge and the
// saved progress are loaded, so useState can start from the saved values.
import {
  completeChallenge,
  markInProgress,
  saveProgressDraft,
} from "@/api/progressApi";
import ImageSelector from "@/components/ImageSelector";
import LocationVerifier, { LocationCheck } from "@/components/LocationVerifier";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/hooks/useChallengeQueries";
import { ChallengeData, ChallengeProgress } from "@/utils/challengeData";
import { isAnswerCorrect, TOTAL_STEPS } from "@/utils/challengeRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { ReactNode, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "./BackButton";

type ResolveFormProps = {
  challenge: ChallengeData;
  savedProgress: ChallengeProgress | null;
};

type AnswerFeedback = "correct" | "wrong" | null;

// "22:51" — a clock time never goes stale, unlike "2 min ago"
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ResolveForm({
  challenge,
  savedProgress,
}: ResolveFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ---------- State, started from whatever was saved last time ----------

  const [photoUris, setPhotoUris] = useState<string[]>(
    savedProgress?.photoUrls ?? [],
  );
  const [answer, setAnswer] = useState(savedProgress?.answer ?? "");
  // A saved answer that was already correct counts as checked
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>(
    savedProgress?.answer &&
      isAnswerCorrect(savedProgress.answer, challenge.answer)
      ? "correct"
      : null,
  );
  // A NEW location check made on this visit (null = none yet)
  const [locationCheck, setLocationCheck] = useState<LocationCheck | null>(
    null,
  );
  // updatedAt can be missing for a moment right after a write (serverTimestamp is pending)
  const [savedAt, setSavedAt] = useState<Date | null>(
    savedProgress?.updatedAt?.toDate?.() ?? null,
  );

  // ---------- Derived values ----------

  // A new check always wins; otherwise fall back to what was saved earlier
  const locationDone = locationCheck
    ? locationCheck.isInside
    : (savedProgress?.locationVerified ?? false);
  const usedMockLocation =
    locationCheck?.usedMockLocation ?? savedProgress?.usedMockLocation ?? false;
  const photoDone = photoUris.length > 0;
  // The answer only counts after "Check answer" — no live hint while typing
  const answerDone = answerFeedback === "correct";

  const stepsDone = [locationDone, photoDone, answerDone].filter(
    Boolean,
  ).length;
  const canComplete = stepsDone === TOTAL_STEPS;
  // The first unfinished step gets a dark outline, guiding the user's eye
  const activeStep = !locationDone
    ? 1
    : !photoDone
      ? 2
      : !answerDone
        ? 3
        : null;

  // ---------- Saving ----------

  // After any write, refetch this user's progress so the list and details
  // screens show the new status and progress bar when the user goes back
  function invalidateProgress() {
    if (!user) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.progressMap(user.uid),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.progress(user.uid, challenge.id),
    });
  }

  // Saves "in progress" as soon as the location check succeeds
  const inProgressMutation = useMutation({
    mutationFn: (usedMock: boolean) => markInProgress(challenge.id, usedMock),
    onSuccess: () => {
      setSavedAt(new Date());
      invalidateProgress();
    },
  });

  // "Save & exit": uploads new photos, stores the answer, then leaves
  const draftMutation = useMutation({
    mutationFn: () =>
      saveProgressDraft(
        challenge.id,
        { locationVerified: locationDone, photoUris, answer },
        usedMockLocation,
      ),
    onSuccess: (photoUrls) => {
      // Swap local URIs for uploaded URLs so a later save doesn't upload them again
      setPhotoUris(photoUrls);
      setSavedAt(new Date());
      invalidateProgress();
      router.back();
    },
  });

  // "Complete": uploads new photos and stores "completed".
  // completeChallenge checks the rules again, so a bypassed button still can't cheat.
  const completeMutation = useMutation({
    mutationFn: () =>
      completeChallenge(
        challenge,
        { locationVerified: locationDone, photoUris, answer },
        usedMockLocation,
      ),
    onSuccess: () => {
      invalidateProgress();
      router.back(); // back to details, which now shows "Completed"
    },
  });

  const isBusy = draftMutation.isPending || completeMutation.isPending;
  const writeError = draftMutation.error ?? completeMutation.error;

  // ---------- Handlers ----------

  function handleLocationResult(check: LocationCheck) {
    setLocationCheck(check);
    if (check.isInside) inProgressMutation.mutate(check.usedMockLocation);
  }

  function handleAnswerChange(text: string) {
    setAnswer(text);
    setAnswerFeedback(null); // a changed answer has to be checked again
  }

  function handleCheckAnswer() {
    setAnswerFeedback(
      isAnswerCorrect(answer, challenge.answer) ? "correct" : "wrong",
    );
  }

  // ---------- UI ----------

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header: back, title, overall progress */}
        <View className="gap-3 px-5 pb-3 pt-2">
          <View className="flex-row items-center gap-3">
            <BackButton />
            <View className="flex-1">
              <Text className="font-body text-sm text-muted">Resolving</Text>
              <Text className="font-display text-xl text-ink" numberOfLines={1}>
                {challenge.title}
              </Text>
            </View>
          </View>
          <ProgressBar completed={stepsDone} total={TOTAL_STEPS} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-4 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <StepCard
            number={1}
            title={
              locationDone ? "You're at the location" : "Verify your location"
            }
            done={locationDone}
            active={activeStep === 1}
          >
            {/* Shown when the location was verified on an earlier visit */}
            {!locationCheck && savedProgress?.locationVerified && (
              <Text className="font-body text-sm text-status-done-ink">
                Verified earlier
                {savedProgress.usedMockLocation ? " (mock location)" : ""}.
              </Text>
            )}
            <LocationVerifier
              target={challenge.target}
              radiusMeters={challenge.radiusMeters}
              result={locationCheck}
              onResult={handleLocationResult}
              disabled={isBusy}
            />
          </StepCard>

          <StepCard
            number={2}
            title="Photo proof"
            done={photoDone}
            active={activeStep === 2}
            aside={
              photoDone
                ? `${photoUris.length} photo${photoUris.length === 1 ? "" : "s"}`
                : undefined
            }
          >
            <ImageSelector
              images={photoUris}
              onChange={setPhotoUris}
              disabled={isBusy}
            />
          </StepCard>

          <StepCard
            number={3}
            title="Answer the question"
            done={answerDone}
            active={activeStep === 3}
          >
            <Text className="font-body text-base text-ink">
              {challenge.question}
            </Text>
            <View className="gap-1">
              <Text className="font-body-semibold text-sm text-ink">
                Your answer
              </Text>
              <TextInput
                className={`h-12 rounded-input border bg-surface px-4 font-body text-base text-ink ${
                  answerFeedback === "wrong"
                    ? "border-danger-ink"
                    : "border-line"
                }`}
                value={answer}
                onChangeText={handleAnswerChange}
                onSubmitEditing={handleCheckAnswer}
                placeholder="Type your answer"
                placeholderTextColor="#55585E"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                editable={!isBusy}
              />
              {answerFeedback === "wrong" && (
                <Text className="font-body text-sm text-danger-ink">
                  Not quite. Try again.
                </Text>
              )}
              {answerFeedback === "correct" && (
                <Text className="font-body text-sm text-status-done-ink">
                  Correct!
                </Text>
              )}
            </View>
            {!answerDone && (
              <Pressable
                onPress={handleCheckAnswer}
                disabled={!answer.trim() || isBusy}
                className={`h-12 items-center justify-center rounded-button bg-ink ${
                  !answer.trim() ? "opacity-40" : "active:opacity-80"
                }`}
              >
                <Text className="font-body-semibold text-base text-surface">
                  Check answer
                </Text>
              </Pressable>
            )}
          </StepCard>
        </ScrollView>

        {/* Footer pinned to the bottom: save state + the two actions */}
        <View className="gap-2 border-t border-line bg-paper px-4 pb-2 pt-3">
          {writeError ? (
            <Text className="text-center font-body text-sm text-danger-ink">
              Could not save: {writeError.message}
            </Text>
          ) : (
            <Text className="text-center font-body text-sm text-muted">
              {savedAt ? `Saved ${formatTime(savedAt)}` : "Not saved yet"}
            </Text>
          )}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => draftMutation.mutate()}
              disabled={isBusy}
              className={`h-[54px] flex-1 items-center justify-center rounded-button border border-line bg-surface ${
                isBusy ? "opacity-50" : "active:opacity-70"
              }`}
            >
              <Text className="font-body-semibold text-base text-ink">
                {draftMutation.isPending ? "Saving…" : "Save & exit"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => completeMutation.mutate()}
              disabled={!canComplete || isBusy}
              className={`h-[54px] flex-1 items-center justify-center rounded-button ${
                canComplete ? "bg-ink active:opacity-80" : "bg-line"
              }`}
            >
              <Text
                className={`font-body-semibold text-base ${canComplete ? "text-surface" : "text-muted"}`}
              >
                {completeMutation.isPending
                  ? "Completing…"
                  : `Complete · ${stepsDone}/${TOTAL_STEPS}`}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Card for one requirement: green check when done, dark outline when it is
// the current step, numbered ring otherwise
function StepCard({
  number,
  title,
  done,
  active,
  aside,
  children,
}: {
  number: number;
  title: string;
  done: boolean;
  active: boolean;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <View
      className={`gap-3 rounded-card bg-surface p-4 ${active ? "border-2 border-ink" : ""}`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            done ? "bg-status-done-ink" : "border-2 border-ink"
          }`}
        >
          {done ? (
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <Text className="font-body-semibold text-sm text-ink">
              {number}
            </Text>
          )}
        </View>
        <Text className="flex-1 font-display text-lg text-ink">{title}</Text>
        {aside && <Text className="font-body text-sm text-muted">{aside}</Text>}
      </View>
      {children}
    </View>
  );
}
