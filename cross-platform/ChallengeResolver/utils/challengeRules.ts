// The rules for completing a challenge, kept in one place as pure functions. The screens use them to show progress and what is still missing,
// and progressApi checks the same ruls again before saving. This way the UI and database can never disagree about what "completed" means.
import { ChallengeProgress, ProgressStatus } from "@/utils/challengeData";

export function getStatus(
  progress: ChallengeProgress | null | undefined,
): ProgressStatus {
  return progress?.status ?? "not_started";
}

export const TOTAL_STEPS = 3;

export interface ResolveAttempt {
  locationVerified: boolean;
  photoUris: string[];
  answer: string;
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAnswerCorrect(given: string, expected: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(expected);
}

export function getStepStatus(attempt: ResolveAttempt, expectedAnswer: string) {
  return {
    location: attempt.locationVerified,
    photo: attempt.photoUris.length > 0,
    answer: isAnswerCorrect(attempt.answer, expectedAnswer),
  };
}

export function countDoneSteps(
  attempt: ResolveAttempt,
  expectedAnswer: string,
): number {
  return Object.values(getStepStatus(attempt, expectedAnswer)).filter(Boolean)
    .length;
}

export function getSavedStepStatus(
  progress: ChallengeProgress | null | undefined,
  expectedAnswer: string,
) {
  if (progress?.status === "completed") {
    return { location: true, photo: true, answer: true };
  }
  return getStepStatus(
    {
      locationVerified: progress?.locationVerified ?? false,
      photoUris: progress?.photoUrls ?? [],
      answer: progress?.answer ?? "",
    },
    expectedAnswer,
  );
}

export function countSavedSteps(
  progress: ChallengeProgress | null | undefined,
  expectedAnswer: string,
): number {
  return Object.values(getSavedStepStatus(progress, expectedAnswer)).filter(
    Boolean,
  ).length;
}

export function getMissingRequirements(
  attempt: ResolveAttempt,
  expectedAnswer: string,
): string[] {
  const missing: string[] = [];
  if (!attempt.locationVerified) {
    missing.push("Verify that you are inside the target area.");
  }
  if (attempt.photoUris.length === 0) {
    missing.push("Take or select at least one photo.");
  }
  if (!attempt.answer.trim()) {
    missing.push("Answer the question.");
  } else if (!isAnswerCorrect(attempt.answer, expectedAnswer)) {
    missing.push("The answer is not correct.");
  }
  return missing;
}
