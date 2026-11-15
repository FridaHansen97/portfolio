// CreateChallengeScreen lets the user create a new challenge. The form itselves is in components/ChallengeForm.tsx
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
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges });
      router.replace({ pathname: "/challenge/[id]", params: { id: newId } });
    },
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
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
