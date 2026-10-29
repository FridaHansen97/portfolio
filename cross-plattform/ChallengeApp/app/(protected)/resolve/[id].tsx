// Resolve screen (requirement 3). This file only loads the challenge and the
// user's saved progress and handles loading / error / not-found / completed.
// The form itself is components/ResolveForm.tsx — it is rendered only once
// the data exists, so it can start its state directly from the saved progress
// instead of copying server data into state with a useEffect.
import { getStatus } from "@/api/progressApi";
import ResolveForm from "@/components/ResolveForm";
import {
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function ResolveChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeQuery = useChallengeQuery(id);
  const progressQuery = useMyProgressQuery(id);

  if (challengeQuery.isLoading || progressQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const loadError = challengeQuery.error ?? progressQuery.error;
  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6">
        <Text className="text-center font-body text-danger-ink">
          Could not load the challenge: {loadError.message}
        </Text>
      </View>
    );
  }

  const challenge = challengeQuery.data;
  if (!challenge) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6">
        <Text className="text-center font-body text-muted">
          This challenge no longer exists.
        </Text>
      </View>
    );
  }

  // Also protects against opening /resolve/<id> directly in the browser
  if (getStatus(progressQuery.data) === "completed") {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6">
        <Text className="text-center font-display text-xl text-status-done-ink">
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
