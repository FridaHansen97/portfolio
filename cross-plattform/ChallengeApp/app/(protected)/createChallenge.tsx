// Screen for creating a new challenge. The form itself lives in
// components/ChallengeForm.tsx; this screen only handles saving and navigation.
import { createChallenge } from "@/api/challengeApi";
import ChallengeForm from "@/components/ChallengeForm";
import { queryKeys } from "@/hooks/useChallengeQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

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
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerClassName="p-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <ChallengeForm
          submitLabel="Create challenge"
          isSubmitting={createMutation.isPending}
          submitError={createMutation.error?.message}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
