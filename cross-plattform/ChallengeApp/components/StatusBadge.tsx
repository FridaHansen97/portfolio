// Small colored pill with an icon showing the user's progress on a challenge.
import { ProgressStatus } from "@/utils/challengeData";
import { Circle, CircleCheck, Contrast, LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

// Hex values for the icons: lucide draws SVG and needs a real color,
// not a Tailwind class. They match the -ink tokens in tailwind.config.js.
const STATUS_STYLES: Record<
  ProgressStatus,
  {
    label: string;
    icon: LucideIcon;
    iconColor: string;
    container: string;
    text: string;
  }
> = {
  not_started: {
    label: "Not started",
    icon: Circle,
    iconColor: "#3A3D42",
    container: "bg-status-todo",
    text: "text-status-todo-ink",
  },
  in_progress: {
    label: "In progress",
    icon: Contrast,
    iconColor: "#1B5135",
    container: "bg-status-active",
    text: "text-status-active-ink",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    iconColor: "#1B5135",
    container: "bg-status-done",
    text: "text-status-done-ink",
  },
};

type StatusBadgeProps = {
  status: ProgressStatus;
  // Optional extra text, e.g. "2 of 3" → "In progress · 2 of 3"
  detail?: string;
};

export default function StatusBadge({ status, detail }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${style.container}`}
    >
      <Icon size={12} color={style.iconColor} strokeWidth={2.5} />
      <Text className={`font-body-semibold text-xs ${style.text}`}>
        {style.label}
        {detail ? ` · ${detail}` : ""}
      </Text>
    </View>
  );
}
