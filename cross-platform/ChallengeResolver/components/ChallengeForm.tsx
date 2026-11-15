// The form for creating or editing a challenge. Kept reusable so multiple screens can use it.
import { validateChallenge } from "@/api/challengeApi";
import ExpandableChallengeMap from "@/components/ExpandableChallengeMap";
import { NewChallengeData } from "@/utils/challengeData";
import { capitalize } from "@/utils/formatUtils";
import { getCurrentLocation, isValidCoords } from "@/utils/locationUtils";
import Slider from "@react-native-community/slider";
import { LocateFixed } from "lucide-react-native";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Difficulty = NonNullable<NewChallengeData["difficulty"]>;
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const PRESET_CATEGORIES = ["Statues", "Signs", "Buildings"];

const MIN_RADIUS = 10;
const MAX_RADIUS = 300;

type ChallengeFormProps = {
  initialData?: NewChallengeData;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (data: NewChallengeData) => void;
};

function parseNumber(text: string): number {
  // Accepts both "59.91" and "59,91" - many people prefer a comma.
  return parseFloat(text.trim().replace(",", "."));
}

export default function ChallengeForm({
  initialData,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: ChallengeFormProps) {
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
  const [radius, setRadius] = useState(initialData?.radiusMeters ?? 50);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty ?? "easy",
  );
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [isOtherCategory, setIsOtherCategory] = useState(
    !!initialData?.category &&
      !PRESET_CATEGORIES.includes(initialData.category),
  );

  const [editingCoords, setEditingCoords] = useState(false);
  const [locating, setLocating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasCoords = latitude.trim() !== "" && longitude.trim() !== "";

  // The map preview needs real numbers. While the user is still typing ("59." or "-"), the coordinates aren't valid yet and the map is hidden.
  const previewTarget = {
    latitude: parseNumber(latitude),
    longitude: parseNumber(longitude),
  };
  const showMap = isValidCoords(
    previewTarget.latitude,
    previewTarget.longitude,
  );

  async function handleUseMyLocation() {
    setValidationError(null);
    setLocating(true);
    try {
      const location = await getCurrentLocation();
      setLatitude(location.latitude.toFixed(6));
      setLongitude(location.longitude.toFixed(6));
      setEditingCoords(false);
    } catch (e) {
      setValidationError(
        e instanceof Error ? e.message : "Could not get your location.",
      );
    } finally {
      setLocating(false);
    }
  }

  function selectPresetCategory(preset: string) {
    setIsOtherCategory(false);
    setCategory((current) => (current === preset ? "" : preset));
  }

  function selectOtherCategory() {
    setIsOtherCategory(true);
    setCategory("");
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
      radiusMeters: radius,
      difficulty,
      ...(category.trim() ? { category: category.trim() } : {}),
    };

    // Same validation as challengeApi — checked here first so the user gets feedback instantly, without a round trip to Firebase.
    const error = validateChallenge(data);
    setValidationError(error);
    if (!error) onSubmit(data);
  }

  const errorMessage = validationError || submitError;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-4 pb-8"
        keyboardShouldPersistTaps="handled"
        // iOS: adds space for the keyboard inside the ScrollView instead of resizing the screen, so scrolling stays where the user put it.
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
      >
        <SectionTitle>What to find</SectionTitle>
        <Card>
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Find the big animal statue"
          />
          <Divider />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Give a hint about where to look"
            multiline
          />
        </Card>

        <SectionTitle>Where</SectionTitle>
        <Card>
          {showMap && (
            // Preview of the target and the radius, updated live as the location or slider changes.
            <ExpandableChallengeMap
              target={previewTarget}
              radiusMeters={radius}
              className="h-[200px] rounded-input"
            />
          )}
          <Pressable
            onPress={handleUseMyLocation}
            disabled={locating || isSubmitting}
            className="h-12 flex-row items-center justify-center gap-2 rounded-button border border-line bg-surface active:opacity-70"
          >
            {locating ? (
              <ActivityIndicator />
            ) : (
              <LocateFixed size={18} color="#17181A" />
            )}
            <Text className="font-body-semibold text-base text-ink">
              Use my location
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEditingCoords((open) => !open)}
            className="py-1"
          >
            <Text className="font-mono text-xs text-muted">
              {hasCoords ? `${latitude}, ${longitude}` : "No coordinates yet"}
              {" · "}
              <Text className="text-ink underline">
                {editingCoords ? "Done" : "Edit manually"}
              </Text>
            </Text>
          </Pressable>

          {editingCoords && (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <PlainInput
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="Latitude"
                  mono
                />
              </View>
              <View className="flex-1">
                <PlainInput
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="Longitude"
                  mono
                />
              </View>
            </View>
          )}

          <View className="mt-1 flex-row items-center justify-between">
            <Text className="font-body-semibold text-sm text-ink">
              Completion radius
            </Text>
            <Text className="font-body-semibold text-base text-ink">
              {radius} m
            </Text>
          </View>
          <Slider
            minimumValue={MIN_RADIUS}
            maximumValue={MAX_RADIUS}
            step={5}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#C2410C"
            maximumTrackTintColor="#D6D2C7"
            thumbTintColor="#C2410C"
            accessibilityLabel="Completion radius in meters"
          />
        </Card>

        <SectionTitle>The question</SectionTitle>
        <Card>
          <Field
            label="Question"
            value={question}
            onChangeText={setQuestion}
            placeholder="What animal is the statue?"
          />
          <Divider />
          <Field
            label="Correct answer"
            value={answer}
            onChangeText={setAnswer}
            placeholder="Tiger"
            autoCapitalize="none"
            hint="One or two words. Capital letters don't matter."
          />
        </Card>

        <SectionTitle>Details</SectionTitle>
        <Text className="font-body-semibold text-sm text-ink">Difficulty</Text>
        <View className="flex-row rounded-button bg-status-todo p-1">
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              className={`h-10 flex-1 items-center justify-center rounded-input ${
                difficulty === d ? "bg-surface" : ""
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: difficulty === d }}
            >
              <Text
                className={`font-body-semibold text-base ${difficulty === d ? "text-ink" : "text-muted"}`}
              >
                {capitalize(d)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-2 font-body-semibold text-sm text-ink">
          Category <Text className="font-body text-muted">(optional)</Text>
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PRESET_CATEGORIES.map((preset) => (
            <Chip
              key={preset}
              label={preset}
              selected={!isOtherCategory && category === preset}
              onPress={() => selectPresetCategory(preset)}
            />
          ))}
          <Chip
            label="+ Other"
            selected={isOtherCategory}
            onPress={selectOtherCategory}
            dashed
          />
        </View>
        {isOtherCategory && (
          <PlainInput
            value={category}
            onChangeText={setCategory}
            placeholder="Your category"
          />
        )}
      </ScrollView>

      <View className="gap-2 border-t border-line bg-paper px-4 pb-2 pt-3">
        {errorMessage && (
          <Text className="text-center font-body text-sm text-danger-ink">
            {errorMessage}
          </Text>
        )}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`h-[54px] items-center justify-center rounded-button bg-ink ${
            isSubmitting ? "opacity-60" : "active:opacity-80"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-body-semibold text-base text-surface">
              {submitLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// Small building blocks only this form uses
function SectionTitle({ children }: { children: ReactNode }) {
  return <Text className="mt-4 font-display text-xl text-ink">{children}</Text>;
}

function Card({ children }: { children: ReactNode }) {
  return <View className="gap-2 rounded-card bg-surface p-4">{children}</View>;
}

function Divider() {
  return <View className="my-1 h-px bg-line" />;
}

function Field({
  label,
  hint,
  multiline,
  ...textInputProps
}: TextInputProps & { label: string; hint?: string }) {
  return (
    <View className="gap-1">
      <Text className="font-body-semibold text-sm text-ink">{label}</Text>
      <TextInput
        className={`font-body text-base text-ink ${multiline ? "min-h-20" : ""}`}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#55585E"
        {...textInputProps}
      />
      {hint && <Text className="font-body text-xs text-muted">{hint}</Text>}
    </View>
  );
}

// Bordered input for standalone fields (coordinates, custom category).
function PlainInput({
  mono = false,
  ...textInputProps
}: TextInputProps & { mono?: boolean }) {
  return (
    <TextInput
      className={`h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink ${
        mono ? "font-mono" : "font-body"
      }`}
      placeholderTextColor="#55585E"
      keyboardType={mono ? "numbers-and-punctuation" : "default"}
      {...textInputProps}
    />
  );
}

function Chip({
  label,
  selected,
  onPress,
  dashed = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  dashed?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        selected
          ? "border-ink bg-ink"
          : `border-line bg-surface ${dashed ? "border-dashed" : ""}`
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        className={`font-body-medium text-sm ${selected ? "text-surface" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
