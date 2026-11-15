// Filtering for the Challenges list - filter by status. These are pure functions, the screen only renders and this file decides what shows.
import {
  ChallengeData,
  ChallengeProgress,
  ProgressStatus,
} from "@/utils/challengeData";
import { getStatus } from "@/utils/challengeRules";

export type StatusFilter = "all" | ProgressStatus;

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "To do" },
  { value: "in_progress", label: "Started" },
  { value: "completed", label: "Done" },
];

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
    counts[getStatus(progressMap[challenge.id])] += 1;
  }
  return counts;
}

export function filterByStatus(
  challenges: ChallengeData[],
  progressMap: Record<string, ChallengeProgress>,
  filter: StatusFilter,
): ChallengeData[] {
  if (filter === "all") return challenges;
  return challenges.filter(
    (challenge) => getStatus(progressMap[challenge.id]) === filter,
  );
}
