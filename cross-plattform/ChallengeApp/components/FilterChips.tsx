// Horizontal row of selectable pills, e.g. "All 5 · To do 2 · Started 1 · Done 2".
// Generic: works for any string value, so it can also be used for
// difficulty or category filters later.
import { Pressable, ScrollView, Text } from "react-native";

type FilterChipsProps<T extends string> = {
  options: { value: T; label: string; count?: number }[];
  selected: T;
  onSelect: (value: T) => void;
};

export default function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    // Scrolls sideways if the chips don't fit on a narrow phone
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={`rounded-full border px-4 py-2 ${
              isSelected
                ? "border-ink bg-ink"
                : "border-line bg-surface active:bg-paper"
            }`}
            // Screen readers announce which chip is active
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`font-body-medium text-sm ${isSelected ? "text-surface" : "text-ink"}`}
            >
              {option.label}
              {option.count !== undefined ? ` ${option.count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
