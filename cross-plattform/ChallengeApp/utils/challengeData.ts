import { Coords } from "@/utils/locationUtils";
import { Timestamp } from "firebase/firestore";

// What the create form submits. No id (Firestore assigns it) and no authorId
// (set from the signed-in user in challengeApi, never trusted from the form).
export interface NewChallengeData {
  title: string;
  description: string;
  question: string;
  answer: string; // expected answer, compared case-insensitively
  target: Coords; // where the user has to be
  radiusMeters: number; // how close counts as "there"
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

// A challenge as stored in Firestore
export interface ChallengeData extends NewChallengeData {
  id: string;
  authorId: string;
  authorName: string; // shown in the UI without an extra lookup
  createdAt?: Timestamp;
}

// "not_started" is never stored — it means "no progress document exists"
export type ProgressStatus = "not_started" | "in_progress" | "completed";

// Stored at users/{uid}/progress/{challengeId}
export interface ChallengeProgress {
  status: "in_progress" | "completed";
  locationVerified: boolean;
  usedMockLocation: boolean;
  photoUrls?: string[]; // Firebase Storage download URLs (evidence)
  answer?: string;
  updatedAt: Timestamp;
}
