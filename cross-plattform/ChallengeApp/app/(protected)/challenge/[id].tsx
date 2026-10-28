// Challenge details (requirement 2). This screen only loads the data and
// handles loading/error/not-found; ChallengeDetailsView draws the content.
import ChallengeDetailsView from "@/components/ChallengeDetailsView";
import {
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function ChallengeDetailsScreen() {
  // The [id] part of the URL, e.g. /challenge/JNC6Zz800O75dIWi5UNF
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

  const error = challengeQuery.error ?? progressQuery.error;
  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-paper p-6">
        <Text className="text-center font-body text-danger-ink">
          Could not load the challenge: {error.message}
        </Text>
        <Pressable
          className="rounded-button bg-ink px-5 py-3"
          onPress={() => {
            challengeQuery.refetch();
            progressQuery.refetch();
          }}
        >
          <Text className="font-body-semibold text-surface">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const challenge = challengeQuery.data;

  // getChallengeById returns null when the document doesn't exist
  // (deleted challenge, or a wrong id typed into the URL on web)
  if (!challenge) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6">
        <Text className="text-center font-body text-muted">
          This challenge no longer exists.
        </Text>
      </View>
    );
  }

  return (
    <ChallengeDetailsView
      challenge={challenge}
      progress={progressQuery.data ?? null}
      // On web, a details page opened straight from a URL has nothing to go back to
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      onStart={() =>
        router.push({ pathname: "/resolve/[id]", params: { id: challenge.id } })
      }
    />
  );
}
