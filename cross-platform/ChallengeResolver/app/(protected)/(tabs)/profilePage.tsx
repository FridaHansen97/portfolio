// Profile tab: loads the signed-in user, the user's progress and the shared challenges list. All are already cached by React Query from the Challenges tab.
import { signOutUser } from "@/api/authApi";
import ProfileView from "@/components/ProfileView";
import { useAuth } from "@/context/AuthContext";
import {
  useChallengesQuery,
  useMyProgressMapQuery,
} from "@/hooks/useChallengeQueries";
import { countByStatus } from "@/utils/challengeFilters";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function ProfilePage() {
  const { user } = useAuth();
  const challengesQuery = useChallengesQuery();
  const progressQuery = useMyProgressMapQuery();

  if (challengesQuery.isLoading || progressQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const error = challengesQuery.error ?? progressQuery.error;
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-6">
        <Text className="text-center font-body text-danger-ink">
          Could not load your profile: {error.message}
        </Text>
        <Pressable
          className="rounded-button bg-ink px-5 py-3"
          onPress={() => {
            challengesQuery.refetch();
            progressQuery.refetch();
          }}
        >
          <Text className="font-body-semibold text-surface">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const challenges = challengesQuery.data ?? [];
  const counts = countByStatus(challenges, progressQuery.data ?? {});
  const createdChallenges = challenges.filter(
    (challenge) => challenge.authorId === user?.uid,
  );

  return (
    <ProfileView
      displayName={user?.displayName ?? null}
      email={user?.email ?? null}
      completedCount={counts.completed}
      inProgressCount={counts.in_progress}
      createdChallenges={createdChallenges}
      onOpenChallenge={(id) =>
        router.push({ pathname: "/challenge/[id]", params: { id } })
      }
      onSignOut={signOutUser}
    />
  );
}
