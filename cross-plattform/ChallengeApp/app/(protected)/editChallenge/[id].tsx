// Lets the author change their own challenge. Reuses ChallengeForm from the
// create screen, filled in with the current values (initialData).
import { updateChallenge } from "@/api/challengeApi";
import BackButton from "@/components/BackButton";
import ChallengeForm from "@/components/ChallengeForm";
import { useAuth } from "@/context/AuthContext";
import { queryKeys, useChallengeQuery } from "@/hooks/useChallengeQueries";
import { NewChallengeData } from "@/utils/challengeData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const challengeQuery = useChallengeQuery(id);

  const updateMutation = useMutation({
    mutationFn: (data: NewChallengeData) => updateChallenge(id, data),
    onSuccess: () => {
      // ["challenges"] is the start of every challenge key, so this refetches
      // both the list and this challenge's details
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges });
      router.back(); // back to the details screen, now with the new values
    },
  });

  // Everything except the form: loading, errors, and checking ownership
  function renderMessage(text: string, isError = false) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text
          className={`text-center font-body ${isError ? "text-danger-ink" : "text-muted"}`}
        >
          {text}
        </Text>
      </View>
    );
  }

  const challenge = challengeQuery.data;

  let content;
  if (challengeQuery.isLoading) {
    content = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (challengeQuery.error) {
    content = renderMessage(
      `Could not load the challenge: ${challengeQuery.error.message}`,
      true,
    );
  } else if (!challenge) {
    content = renderMessage("This challenge no longer exists.");
  } else if (challenge.authorId !== user?.uid) {
    // The edit button is only shown to the author, but the URL can be typed by hand on web
    content = renderMessage("You can only edit challenges you created.");
  } else {
    // Only the fields the form edits — id, author and timestamps stay as they are
    const initialData: NewChallengeData = {
      title: challenge.title,
      description: challenge.description,
      question: challenge.question,
      answer: challenge.answer,
      target: challenge.target,
      radiusMeters: challenge.radiusMeters,
      difficulty: challenge.difficulty,
      category: challenge.category,
    };
    content = (
      <ChallengeForm
        initialData={initialData}
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error?.message}
        onSubmit={(data) => updateMutation.mutate(data)}
      />
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      {/* Same header as the create screen */}
      <View className="h-14 flex-row items-center justify-center px-4">
        <View className="absolute left-4">
          <BackButton />
        </View>
        <Text className="font-body-semibold text-base text-ink">
          Edit challenge
        </Text>
      </View>
      {content}
    </SafeAreaView>
  );
}
