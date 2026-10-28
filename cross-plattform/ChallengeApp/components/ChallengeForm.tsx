// Form for creating a challenge. Kept separate from the screen so the same
// form can be reused for editing later (initialData + a different onSubmit).
import { validateChallenge } from "@/api/challengeApi";
import FormField from "@/components/FormField";
import { NewChallengeData } from "@/utils/challengeData";
import { getCurrentLocation } from "@/utils/locationUtils";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Difficulty = NonNullable<NewChallengeData["difficulty"]>;
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

type ChallengeFormProps = {
  initialData?: NewChallengeData;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (data: NewChallengeData) => void;
};

// Accepts both "59.91" and "59,91" — a Norwegian keyboard often gives a comma
function parseNumber(text: string): number {
  return parseFloat(text.trim().replace(",", "."));
}

export default function ChallengeForm({
  initialData,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: ChallengeFormProps) {
  // Every field is kept as a string while typing; numbers are parsed on submit.
  // Parsing on every keystroke would turn "59." into 59 and eat the dot.
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [answer, setAnswer] = useState(initialData?.answer ?? "");
  const [latitude, setLatitude] = useState(
    initialData?.target.latitude.toString() ?? "",
  );
  const [longitude, setLongitude] = useState(
    initialData?.target.longitude.toString() ?? "",
  );
  const [radius, setRadius] = useState(
    initialData?.radiusMeters.toString() ?? "50",
  );
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty ?? "easy",
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Fills the coordinate fields with the device's position — easier than
  // typing coordinates when creating a challenge on the spot
  async function handleUseMyLocation() {
    setValidationError(null);
    setLocating(true);
    try {
      const location = await getCurrentLocation();
      setLatitude(location.latitude.toFixed(6));
      setLongitude(location.longitude.toFixed(6));
    } catch (e) {
      setValidationError(
        e instanceof Error ? e.message : "Could not get your location.",
      );
    } finally {
      setLocating(false);
    }
  }

  function handleSubmit() {
    const data: NewChallengeData = {
      title: title.trim(),
      description: description.trim(),
      question: question.trim(),
      answer: answer.trim(),
      target: {
        latitude: parseNumber(latitude),
        longitude: parseNumber(longitude),
      },
      radiusMeters: parseNumber(radius),
      difficulty,
      // Firestore rejects undefined values, so only include category when it has text
      ...(category.trim() ? { category: category.trim() } : {}),
    };

    // Same validation as challengeApi — checked here first so the user
    // gets feedback instantly, without a round trip to Firebase
    const error = validateChallenge(data);
    setValidationError(error);
    if (!error) onSubmit(data);
  }

  const errorMessage = validationError ?? submitError;

  return (
    <View className="gap-4">
      <FormField
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Find the tiger statue"
      />
      <FormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What should the user look for?"
        multiline
      />
      <FormField
        label="Question"
        value={question}
        onChangeText={setQuestion}
        placeholder="What animal is the statue?"
      />
      <FormField
        label="Answer"
        value={answer}
        onChangeText={setAnswer}
        placeholder="tiger"
        autoCapitalize="none"
        hint="Not case-sensitive. Keep it short so it is easy to type correctly."
      />

      {/* Target location */}
      <View className="gap-2">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <FormField
              label="Latitude"
              value={latitude}
              onChangeText={setLatitude}
              placeholder="59.9111"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Longitude"
              value={longitude}
              onChangeText={setLongitude}
              placeholder="10.7528"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-lg border border-blue-500 py-3 active:bg-blue-50"
          onPress={handleUseMyLocation}
          disabled={locating || isSubmitting}
        >
          {locating && <ActivityIndicator />}
          <Text className="font-semibold text-blue-500">
            📍 Use my current location
          </Text>
        </Pressable>
      </View>

      <FormField
        label="Completion radius (meters)"
        value={radius}
        onChangeText={setRadius}
        keyboardType="number-pad"
        hint="How close the user must be to the target."
      />

      <FormField
        label="Category (optional)"
        value={category}
        onChangeText={setCategory}
        placeholder="Statues, Signs, …"
      />

      {/* Difficulty picker */}
      <View className="gap-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Difficulty
        </Text>
        <View className="flex-row gap-2">
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d}
              className={`flex-1 items-center rounded-lg border py-2 ${
                difficulty === d
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 bg-white"
              }`}
              onPress={() => setDifficulty(d)}
            >
              <Text
                className={
                  difficulty === d
                    ? "font-semibold text-white"
                    : "text-gray-700"
                }
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {errorMessage && <Text className="text-red-600">{errorMessage}</Text>}

      <Pressable
        className={`items-center rounded-lg py-4 ${isSubmitting ? "bg-gray-300" : "bg-blue-500 active:opacity-70"}`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-base font-semibold text-white">
            {submitLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
