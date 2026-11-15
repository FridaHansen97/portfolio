// Requirement 2: Challenge details. This screen loads the data, handles loading/error/not-found and deleting.
import { deleteChallenge } from "@/api/challengeApi";
import ChallengeDetailsView from "@/components/ChallengeDetailsView";
import MessageScreen from "@/components/MessageScreen";
import { useAuth } from "@/context/AuthContext";
import {
  queryKeys,
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const challengeQuery = useChallengeQuery(id);
  const progressQuery = useMyProgressQuery(id);

  const deleteMutation = useMutation({
    mutationFn: () => deleteChallenge(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.challenge(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges });
      router.replace("/");
    },
  });

  if (challengeQuery.isLoading || progressQuery.isLoading) {
    return <MessageScreen loading />;
  }

  const error = challengeQuery.error ?? progressQuery.error;
  if (error) {
    return (
      <MessageScreen
        message={`Could not load the challenge: ${error.message}`}
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

  return (
    <ChallengeDetailsView
      challenge={challenge}
      progress={progressQuery.data ?? null}
      onStart={() =>
        router.push({
          pathname: "/resolve/[id]",
          params: { id: challenge.id },
        })
      }
      isAuthor={challenge.authorId === user?.uid}
      onEdit={() =>
        router.push({
          pathname: "/editChallenge/[id]",
          params: { id: challenge.id },
        })
      }
      onDelete={() => deleteMutation.mutate()}
      isDeleting={deleteMutation.isPending}
      deleteError={deleteMutation.error?.message}
    />
  );
}
