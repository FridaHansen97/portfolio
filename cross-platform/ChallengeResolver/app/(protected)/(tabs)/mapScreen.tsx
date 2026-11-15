// Map tab: one pin for every challenge. Clicking on a pin shows the challenge and by clicking "open" you get navigated to the detailes screen.
// components/AllChallengesMapView.native.tsx -> react-native-maps for iOS / Android.
// components/AllChallengesMapView.tsx -> Google Maps JavaScript API for Web.
import AllChallengesMapView from "@/components/AllChallengesMapView";
import { useChallengesQuery } from "@/hooks/useChallengeQueries";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapScreen() {
  const challengesQuery = useChallengesQuery();
  const challenges = challengesQuery.data ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <View className="px-5 pb-3 pt-4">
        <Text className="font-display text-[32px] leading-10 text-ink">
          Map
        </Text>
        {challengesQuery.isSuccess && (
          <Text className="font-body text-base text-muted">
            {challenges.length === 0
              ? "No challenges yet. Create one on the Challenges tab."
              : `${challenges.length} challenge${challenges.length === 1 ? "" : "s"} · tap a pin to open`}
          </Text>
        )}
      </View>

      {challengesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : challengesQuery.error ? (
        <View className="flex-1 items-center justify-center gap-3 p-6">
          <Text className="text-center font-body text-danger-ink">
            Could not load challenges: {challengesQuery.error.message}
          </Text>
          <Pressable
            className="rounded-button bg-ink px-5 py-3"
            onPress={() => challengesQuery.refetch()}
          >
            <Text className="font-body-semibold text-surface">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <AllChallengesMapView challenges={challenges} className="flex-1" />
      )}
    </SafeAreaView>
  );
}
