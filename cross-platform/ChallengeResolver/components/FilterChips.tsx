// Horizontal row of selectable pills: "All", "To do", "Started", "Done", all with count. Works for any string value and can therfore be reused.
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
