// Challenges overview (requirement 1): every challenge with the signed-in
// user's own status — Not started / In progress / Completed.
import { getStatus } from "@/api/progressApi";
import ChallengeCard from "@/components/ChallengeCard";
import {
  useChallengesQuery,
  useMyProgressMapQuery,
} from "@/hooks/useChallengeQueries";
import { countSavedSteps } from "@/utils/challengeRules";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function ChallengesScreen() {
  // Two independent queries: shared challenges + this user's progress
  const challengesQuery = useChallengesQuery();
  const progressQuery = useMyProgressMapQuery();

  const isLoading = challengesQuery.isLoading || progressQuery.isLoading;
  const error = challengesQuery.error ?? progressQuery.error;

  // Retry both, used by the error state and pull-to-refresh
  function refetchAll() {
    challengesQuery.refetch();
    progressQuery.refetch();
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Text className="text-center text-red-600">
          Could not load challenges: {error.message}
        </Text>
        <Pressable
          className="rounded-lg bg-blue-500 px-5 py-3"
          onPress={refetchAll}
        >
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const challenges = challengesQuery.data ?? [];
  const progressMap = progressQuery.data ?? {};

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4"
      data={challenges}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChallengeCard
          challenge={item}
          // No progress document → "not_started"
          status={getStatus(progressMap[item.id])}
          stepsDone={countSavedSteps(progressMap[item.id], item.answer)}
          onPress={() =>
            router.push({
              pathname: "/challenge/[id]",
              params: { id: item.id },
            })
          }
        />
      )}
      refreshing={challengesQuery.isRefetching || progressQuery.isRefetching}
      onRefresh={refetchAll}
      ListEmptyComponent={
        <Text className="mt-10 text-center text-gray-500">
          No challenges yet. Create the first one!
        </Text>
      }
    />
  );
}
