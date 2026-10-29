// Profile tab: loads the signed-in user, their progress and the shared
// challenge list (both already cached by React Query from the Challenges tab),
// works out the numbers, and lets ProfileView draw them.
import { signOutUser } from "@/api/authApi";
import ProfileView from "@/components/ProfileView";
import { useAuth } from "@/context/AuthContext";
import {
  useChallengesQuery,
  useMyProgressMapQuery,
} from "@/hooks/useChallengeQueries";
import { countByStatus } from "@/utils/challengeFilters";
import { router } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

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
      </View>
    );
  }

  const challenges = challengesQuery.data ?? [];
  // Same counting as the filter chips on the Challenges tab
  const counts = countByStatus(challenges, progressQuery.data ?? {});
  const createdChallenges = challenges.filter((c) => c.authorId === user?.uid);

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
      // No navigation needed: the guard in (protected)/_layout.tsx sees
      // user === null and redirects to /auth automatically
      onSignOut={signOutUser}
    />
  );
}
