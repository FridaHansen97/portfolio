// Label + text input, styled the same everywhere a form needs a field.
// Passes any extra TextInput props (keyboardType, multiline, …) straight through.
import { Text, TextInput, TextInputProps, View } from "react-native";

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

export default function FormField({
  label,
  hint,
  multiline,
  ...inputProps
}: FormFieldProps) {
  return (
    <View className="gap-1">
      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <TextInput
        className={`rounded-lg border border-gray-300 bg-white px-3 py-3 text-base ${
          multiline ? "min-h-24" : ""
        }`}
        multiline={multiline}
        // Multiline inputs start at the top on Android instead of the middle
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#9ca3af"
        {...inputProps}
      />
      {hint && <Text className="text-xs text-gray-400">{hint}</Text>}
    </View>
  );
}
