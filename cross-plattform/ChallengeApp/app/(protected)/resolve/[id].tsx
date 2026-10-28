// Resolve screen (requirement 3). The user must:
//   1. verify their location (GPS or mock)
//   2. take or select at least one photo
//   3. answer the question correctly
// "Save progress" stores an unfinished attempt so the user can continue later.
// "Complete challenge" only works when all three are done. Photos are uploaded
// to Firebase Storage and the result is saved to the user's own progress.
//
// The screen is split in two:
//   ResolveChallengeScreen — loads the data and handles loading/error states
//   ResolveForm            — the actual form, rendered only once data exists
// This lets ResolveForm start its useState directly from the saved progress,
// instead of copying server data into state with a useEffect.
import {
  completeChallenge,
  getStatus,
  markInProgress,
  saveProgressDraft,
} from "@/api/progressApi";
import ImageSelector from "@/components/ImageSelector";
import LocationVerifier, { LocationCheck } from "@/components/LocationVerifier";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import {
  queryKeys,
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { ChallengeData, ChallengeProgress } from "@/utils/challengeData";
import {
  countDoneSteps,
  getMissingRequirements,
  getStepStatus,
  ResolveAttempt,
  TOTAL_STEPS,
} from "@/utils/challengeRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

// ================= Data loading =================

export default function ResolveChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeQuery = useChallengeQuery(id);
  const progressQuery = useMyProgressQuery(id);

  if (challengeQuery.isLoading || progressQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const loadError = challengeQuery.error ?? progressQuery.error;
  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-red-600">
          Could not load the challenge: {loadError.message}
        </Text>
      </View>
    );
  }

  const challenge = challengeQuery.data;
  if (!challenge) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-gray-500">
          This challenge no longer exists.
        </Text>
      </View>
    );
  }

  // Also protects against opening /resolve/<id> directly in the browser
  if (getStatus(progressQuery.data) === "completed") {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-lg font-semibold text-green-700">
          You have already completed this challenge ✓
        </Text>
      </View>
    );
  }

  return (
    <ResolveForm
      challenge={challenge}
      savedProgress={progressQuery.data ?? null}
    />
  );
}

// ================= The form =================

type ResolveFormProps = {
  challenge: ChallengeData;
  savedProgress: ChallengeProgress | null;
};

function ResolveForm({ challenge, savedProgress }: ResolveFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Start from whatever was saved last time ("Continue challenge")
  const [photoUris, setPhotoUris] = useState<string[]>(
    savedProgress?.photoUrls ?? [],
  );
  const [answer, setAnswer] = useState(savedProgress?.answer ?? "");
  // A NEW location check made on this visit (null = none yet)
  const [locationCheck, setLocationCheck] = useState<LocationCheck | null>(
    null,
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // A new check always wins; otherwise fall back to what was saved earlier
  const locationVerified = locationCheck
    ? locationCheck.isInside
    : (savedProgress?.locationVerified ?? false);
  const usedMockLocation =
    locationCheck?.usedMockLocation ?? savedProgress?.usedMockLocation ?? false;

  const attempt: ResolveAttempt = { locationVerified, photoUris, answer };
  const steps = getStepStatus(attempt, challenge.answer);
  const stepsDone = countDoneSteps(attempt, challenge.answer);
  const missing = getMissingRequirements(attempt, challenge.answer);

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
    onSuccess: invalidateProgress,
  });

  // "Save progress": uploads new photos and stores the answer
  const draftMutation = useMutation({
    mutationFn: () =>
      saveProgressDraft(challenge.id, attempt, usedMockLocation),
    onSuccess: (photoUrls) => {
      // Swap local URIs for the uploaded URLs so the next save doesn't upload them again
      setPhotoUris(photoUrls);
      setSavedMessage("Progress saved ✓");
      invalidateProgress();
    },
  });

  // "Complete challenge": uploads new photos and stores "completed"
  const completeMutation = useMutation({
    mutationFn: () => completeChallenge(challenge, attempt, usedMockLocation),
    onSuccess: () => {
      invalidateProgress();
      router.back(); // back to details, which now shows "Completed"
    },
  });

  function handleLocationResult(check: LocationCheck) {
    setLocationCheck(check);
    setSavedMessage(null);
    if (check.isInside) {
      inProgressMutation.mutate(check.usedMockLocation);
    }
  }

  // Any change after a save means there is something new to save
  function handlePhotosChange(uris: string[]) {
    setPhotoUris(uris);
    setSavedMessage(null);
  }

  function handleAnswerChange(text: string) {
    setAnswer(text);
    setSavedMessage(null);
  }

  const isBusy = draftMutation.isPending || completeMutation.isPending;
  const writeError = draftMutation.error ?? completeMutation.error;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-bold">{challenge.title}</Text>
        <ProgressBar
          completed={stepsDone}
          total={TOTAL_STEPS}
          label="requirements done"
        />

        <Step number={1} title="Verify your location" done={steps.location}>
          {/* Shown when the location was verified on an earlier visit */}
          {!locationCheck && savedProgress?.locationVerified && (
            <Text className="text-sm text-green-700">
              ✓ Verified earlier
              {savedProgress.usedMockLocation ? " (mock location)" : ""}. You
              can check again below.
            </Text>
          )}
          <LocationVerifier
            target={challenge.target}
            radiusMeters={challenge.radiusMeters}
            result={locationCheck}
            onResult={handleLocationResult}
            disabled={isBusy}
          />
        </Step>

        <Step number={2} title="Add photo evidence" done={steps.photo}>
          <ImageSelector images={photoUris} onChange={handlePhotosChange} />
        </Step>

        <Step number={3} title="Answer the question" done={steps.answer}>
          <Text className="text-base text-gray-800">{challenge.question}</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-3"
            placeholder="Your answer"
            value={answer}
            onChangeText={handleAnswerChange}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isBusy}
          />
        </Step>

        {/* What is still missing — Complete stays disabled until this is empty */}
        {missing.length > 0 && (
          <View className="gap-1 rounded-xl bg-amber-50 p-4">
            <Text className="font-semibold text-amber-800">Still missing:</Text>
            {missing.map((m) => (
              <Text key={m} className="text-amber-800">
                • {m}
              </Text>
            ))}
          </View>
        )}

        {writeError && (
          <Text className="text-red-600">
            Could not save: {writeError.message}
          </Text>
        )}
        {savedMessage && (
          <Text className="text-center text-green-700">{savedMessage}</Text>
        )}

        <View className="flex-row gap-3">
          <Pressable
            className={`flex-1 items-center rounded-lg border py-4 ${
              isBusy ? "border-gray-300" : "border-blue-500 active:bg-blue-50"
            }`}
            disabled={isBusy}
            onPress={() => draftMutation.mutate()}
          >
            {draftMutation.isPending ? (
              <ActivityIndicator />
            ) : (
              <Text
                className={`font-semibold ${isBusy ? "text-gray-400" : "text-blue-500"}`}
              >
                Save progress
              </Text>
            )}
          </Pressable>

          <Pressable
            className={`flex-1 items-center rounded-lg py-4 ${
              missing.length === 0 && !isBusy
                ? "bg-green-600 active:opacity-70"
                : "bg-gray-300"
            }`}
            disabled={missing.length > 0 || isBusy}
            onPress={() => completeMutation.mutate()}
          >
            {completeMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-semibold text-white">Complete</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Numbered card for each requirement, with a check mark when it is fulfilled
function Step({
  number,
  title,
  done,
  children,
}: {
  number: number;
  title: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-xl bg-white p-4">
      <View className="flex-row items-center gap-2">
        <View
          className={`h-7 w-7 items-center justify-center rounded-full ${
            done ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <Text className="font-bold text-white">{done ? "✓" : number}</Text>
        </View>
        <Text className="text-lg font-semibold">{title}</Text>
      </View>
      {children}
    </View>
  );
}
