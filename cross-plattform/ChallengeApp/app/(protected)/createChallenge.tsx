// Screen for creating a new challenge. The form itself lives in
// components/ChallengeForm.tsx; this screen only draws the header and
// handles saving and navigation.
import { createChallenge } from "@/api/challengeApi";
import BackButton from "@/components/BackButton";
import ChallengeForm from "@/components/ChallengeForm";
import { queryKeys } from "@/hooks/useChallengeQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateChallengeScreen() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createChallenge,
    onSuccess: (newId) => {
      // The list is now out of date — refetch it next time it is shown
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges });
      // replace (not push): pressing back from the new challenge should go to
      // the list, not back into an already-submitted form
      router.replace({ pathname: "/challenge/[id]", params: { id: newId } });
    },
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      {/* Header: Cancel on the left, title centered */}
      {/* Header: back button on the left, title centered on the screen */}
      <View className="h-14 flex-row items-center justify-center px-4">
        <View className="absolute left-4">
          <BackButton />
        </View>
        <Text className="font-body-semibold text-base text-ink">
          New challenge
        </Text>
      </View>

      <ChallengeForm
        submitLabel="Publish challenge"
        isSubmitting={createMutation.isPending}
        submitError={createMutation.error?.message}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </SafeAreaView>
  );
}
