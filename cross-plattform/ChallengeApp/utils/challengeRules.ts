// The rules for completing a challenge, kept in one place as pure functions
// (no Firebase, no React). The screens use them to show progress and what is
// still missing, and progressApi uses the same rules again before saving — so
// the UI and the database can never disagree about what "completed" means.
import { ChallengeProgress } from "@/utils/challengeData";

// Number of requirements: location, photo, answer
export const TOTAL_STEPS = 3;

// Everything the user has gathered on the Resolve screen so far.
// photoUris can be local (not uploaded yet) or remote (saved earlier).
export interface ResolveAttempt {
  locationVerified: boolean;
  photoUris: string[];
  answer: string;
}

// Normalizes an answer so "Tiger", " tiger " and "TIGER" all count as the same.
// Also collapses repeated spaces inside the answer ("big  tiger" → "big tiger").
export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAnswerCorrect(given: string, expected: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(expected);
}

// Which of the three requirements are fulfilled
export function getStepStatus(attempt: ResolveAttempt, expectedAnswer: string) {
  return {
    location: attempt.locationVerified,
    photo: attempt.photoUris.length > 0,
    answer: isAnswerCorrect(attempt.answer, expectedAnswer),
  };
}

// How many of the three requirements are fulfilled (0–3)
export function countDoneSteps(
  attempt: ResolveAttempt,
  expectedAnswer: string,
): number {
  return Object.values(getStepStatus(attempt, expectedAnswer)).filter(Boolean)
    .length;
}

// Step status from what is SAVED in Firestore — used by the list and details
// screens, which only know the stored progress document, not the live screen
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

// How many saved steps are done (0–3)
export function countSavedSteps(
  progress: ChallengeProgress | null | undefined,
  expectedAnswer: string,
): number {
  return Object.values(getSavedStepStatus(progress, expectedAnswer)).filter(
    Boolean,
  ).length;
}

// Returns a list of requirements that are NOT yet fulfilled.
// An empty list means the challenge can be completed.
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

export function canComplete(
  attempt: ResolveAttempt,
  expectedAnswer: string,
): boolean {
  return getMissingRequirements(attempt, expectedAnswer).length === 0;
}
