// app/(protected)/challenge/[id].tsx
// Challenge details (requirement 2): shows every field of one challenge plus
// the signed-in user's status, and leads to the Resolve screen.
import { getStatus } from "@/api/progressApi";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import {
  useChallengeQuery,
  useMyProgressQuery,
} from "@/hooks/useChallengeQueries";
import { countSavedSteps, TOTAL_STEPS } from "@/utils/challengeRules";
import { router, useLocalSearchParams } from "expo-router";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ChallengeDetailsScreen() {
  // The [id] part of the URL, e.g. /challenge/JNC6Zz800O75dIWi5UNF
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

  const error = challengeQuery.error ?? progressQuery.error;
  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Text className="text-center text-red-600">
          Could not load the challenge: {error.message}
        </Text>
        <Pressable
          className="rounded-lg bg-blue-500 px-5 py-3"
          onPress={() => {
            challengeQuery.refetch();
            progressQuery.refetch();
          }}
        >
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const challenge = challengeQuery.data;

  // getChallengeById returns null when the document doesn't exist
  // (deleted challenge, or a wrong id typed into the URL on web)
  if (!challenge) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-gray-500">
          This challenge no longer exists.
        </Text>
      </View>
    );
  }

  const status = getStatus(progressQuery.data);
  const isCompleted = status === "completed";

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="gap-4 p-4"
    >
      {/* Title + status */}
      <View className="gap-2">
        <Text className="text-2xl font-bold">{challenge.title}</Text>
        <StatusBadge status={status} />
        {status === "in_progress" && (
          <ProgressBar
            completed={countSavedSteps(progressQuery.data, challenge.answer)}
            total={TOTAL_STEPS}
            label="requirements saved"
          />
        )}
      </View>

      <DetailSection label="Description">
        <Text className="text-base text-gray-800">{challenge.description}</Text>
      </DetailSection>

      <DetailSection label="Question">
        <Text className="text-base text-gray-800">{challenge.question}</Text>
      </DetailSection>

      <DetailSection label="Target location">
        <Text className="text-base text-gray-800">
          {challenge.target.latitude.toFixed(5)},{" "}
          {challenge.target.longitude.toFixed(5)}
        </Text>
        <Text className="text-sm text-gray-500">
          You must be within {challenge.radiusMeters} m of this point.
        </Text>
      </DetailSection>

      <DetailSection label="To complete this challenge">
        <Text className="text-base text-gray-800">1. Verify your location</Text>
        <Text className="text-base text-gray-800">
          2. Take or select a photo
        </Text>
        <Text className="text-base text-gray-800">3. Answer the question</Text>
      </DetailSection>

      <Text className="text-xs text-gray-400">
        Created by {challenge.authorName}
      </Text>

      {/* A completed challenge can't be resolved again */}
      <Pressable
        className={`mt-2 items-center rounded-lg py-4 ${
          isCompleted ? "bg-gray-300" : "bg-blue-500 active:opacity-70"
        }`}
        disabled={isCompleted}
        onPress={() =>
          router.push({
            pathname: "/resolve/[id]",
            params: { id: challenge.id },
          })
        }
      >
        <Text className="text-base font-semibold text-white">
          {isCompleted
            ? "Completed ✓"
            : status === "in_progress"
              ? "Continue challenge"
              : "Start challenge"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// White card with a small uppercase label — keeps every section looking the same
function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1 rounded-xl bg-white p-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </Text>
      {children}
    </View>
  );
}
