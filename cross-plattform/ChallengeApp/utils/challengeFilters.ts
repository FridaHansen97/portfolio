// Filtering for the Challenges list (extension: "Filter by status").
// Pure functions, so the screen only renders and this file decides what shows.
import {
    ChallengeData,
    ChallengeProgress,
    ProgressStatus,
} from "@/utils/challengeData";

export type StatusFilter = "all" | ProgressStatus;

// Order and labels of the filter chips
export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "To do" },
  { value: "in_progress", label: "Started" },
  { value: "completed", label: "Done" },
];

// "Not started" is never stored, so a missing progress document means not_started
function statusOf(
  challengeId: string,
  progressMap: Record<string, ChallengeProgress>,
): ProgressStatus {
  return progressMap[challengeId]?.status ?? "not_started";
}

// Number of challenges per filter — shown inside each chip ("Done 2")
export function countByStatus(
  challenges: ChallengeData[],
  progressMap: Record<string, ChallengeProgress>,
): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = {
    all: challenges.length,
    not_started: 0,
    in_progress: 0,
    completed: 0,
  };
  for (const challenge of challenges) {
    counts[statusOf(challenge.id, progressMap)] += 1;
  }
  return counts;
}

export function filterByStatus(
  challenges: ChallengeData[],
  progressMap: Record<string, ChallengeProgress>,
  filter: StatusFilter,
): ChallengeData[] {
  if (filter === "all") return challenges;
  return challenges.filter((c) => statusOf(c.id, progressMap) === filter);
}
