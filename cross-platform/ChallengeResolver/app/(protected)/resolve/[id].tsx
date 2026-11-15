//Requirement 3: ResolveScreen: This file only loads the challenge and the user's saved progress and handles loading, error, not-found, completed.
import MessageScreen from "@/components/MessageScreen";
import ResolveForm from "@/components/ResolveForm";
import {
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { getStatus } from "@/utils/challengeRules";
import { useLocalSearchParams } from "expo-router";

export default function ResolveChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeQuery = useChallengeQuery(id);
  const progressQuery = useMyProgressQuery(id);

  if (challengeQuery.isLoading || progressQuery.isLoading) {
    return <MessageScreen loading />;
  }

  const loadError = challengeQuery.error ?? progressQuery.error;
  if (loadError) {
    return (
      <MessageScreen
        message={`Could not load the challenge: ${loadError.message}`}
        tone="error"
        onRetry={() => {
          challengeQuery.refetch();
          progressQuery.refetch();
        }}
      />
    );
  }

  const challenge = challengeQuery.data;
  if (!challenge) {
    return <MessageScreen message="This challenge no longer exists." />;
  }

  if (getStatus(progressQuery.data) === "completed") {
    return (
      <MessageScreen
        message="You have already completed this challenge"
        tone="success"
      />
    );
  }

  return (
    <ResolveForm
      challenge={challenge}
      savedProgress={progressQuery.data ?? null}
    />
  );
}
