// What the create form submits. No id because Firestore assigns it.
import { Coords } from "@/utils/locationUtils";
import { Timestamp } from "firebase/firestore";

export interface NewChallengeData {
  title: string;
  description: string;
  question: string;
  answer: string;
  target: Coords;
  radiusMeters: number;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface ChallengeData extends NewChallengeData {
  id: string;
  authorId: string;
  authorName: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface ChallengeProgress {
  status: "in_progress" | "completed";
  locationVerified: boolean;
  usedMockLocation: boolean;
  photoUrls?: string[];
  answer?: string;
  updatedAt: Timestamp;
}
