// Requirement 1: Challenges overview: list of all challenges together with the user@s progress.
import ChallengeCard from "@/components/ChallengeCard";
import FilterChips from "@/components/FilterChips";
import {
  useChallengesQuery,
  useMyProgressMapQuery,
} from "@/hooks/useChallengeQueries";
import {
  countByStatus,
  filterByStatus,
  STATUS_FILTERS,
  StatusFilter,
} from "@/utils/challengeFilters";
import { countSavedSteps, getStatus } from "@/utils/challengeRules";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChallengesScreen() {
  const challengesQuery = useChallengesQuery();
  const progressQuery = useMyProgressMapQuery();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const isLoading = challengesQuery.isLoading || progressQuery.isLoading;
  const error = challengesQuery.error ?? progressQuery.error;

  function refetchAll() {
    challengesQuery.refetch();
    progressQuery.refetch();
  }

  const challenges = challengesQuery.data ?? [];
  const progressMap = progressQuery.data ?? {};

  const counts = countByStatus(challenges, progressMap);
  const visibleChallenges = filterByStatus(challenges, progressMap, filter);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
        <View>
          <Text className="font-display text-[32px] leading-10 text-ink">
            Challenges
          </Text>
          {!isLoading && !error && (
            <Text className="font-body text-base text-muted">
              {counts.completed} of {counts.all} completed
            </Text>
          )}
        </View>
        <Pressable
          className="h-12 w-12 items-center justify-center rounded-full bg-ink active:opacity-70"
          onPress={() => router.push("/createChallenge")}
          accessibilityRole="button"
          accessibilityLabel="Create a new challenge"
        >
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center font-body text-danger-ink">
            Could not load challenges: {error.message}
          </Text>
          <Pressable
            className="rounded-button bg-ink px-5 py-3"
            onPress={refetchAll}
          >
            <Text className="font-body-semibold text-surface">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="px-5 pb-3">
            <FilterChips
              options={STATUS_FILTERS.map((option) => ({
                ...option,
                count: counts[option.value],
              }))}
              selected={filter}
              onSelect={setFilter}
            />
          </View>
          <FlatList
            className="flex-1"
            contentContainerClassName="px-4 pb-6"
            data={visibleChallenges}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChallengeCard
                challenge={item}
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
            refreshing={
              challengesQuery.isRefetching || progressQuery.isRefetching
            }
            onRefresh={refetchAll}
            ListEmptyComponent={
              <Text className="mt-10 text-center font-body text-muted">
                {filter === "all"
                  ? "No challenges yet. Tap + to create the first one!"
                  : "No challenges here."}
              </Text>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}
