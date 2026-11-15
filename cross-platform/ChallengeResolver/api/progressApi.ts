// Requirement 5: Reads and writes the signed-in user's progress. Each user has their own progress. so one user's progress never overwrites another's.
import { uploadNewPhotos } from "@/api/imageApi";
import { auth, db } from "@/firebaseConfig";
import { ChallengeData, ChallengeProgress } from "@/utils/challengeData";
import { getMissingRequirements, ResolveAttempt } from "@/utils/challengeRules";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

function requireUid(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");
  return user.uid;
}

function progressCollection(uid: string) {
  return collection(db, "users", uid, "progress");
}

function progressDoc(uid: string, challengeId: string) {
  return doc(progressCollection(uid), challengeId);
}

// Reads
export async function getMyProgressMap(): Promise<
  Record<string, ChallengeProgress>
> {
  const snapshot = await getDocs(progressCollection(requireUid()));
  const map: Record<string, ChallengeProgress> = {};
  snapshot.docs.forEach((docSnap) => {
    map[docSnap.id] = docSnap.data() as ChallengeProgress;
  });
  return map;
}

export async function getMyProgress(
  challengeId: string,
): Promise<ChallengeProgress | null> {
  const snap = await getDoc(progressDoc(requireUid(), challengeId));
  return snap.exists() ? (snap.data() as ChallengeProgress) : null;
}

// Writes
// Marks the challenge as "in progress" as soon as the user has verified their location.
export async function markInProgress(
  challengeId: string,
  usedMockLocation: boolean,
): Promise<void> {
  await setDoc(
    progressDoc(requireUid(), challengeId),
    {
      status: "in_progress",
      locationVerified: true,
      usedMockLocation,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveProgressDraft(
  challengeId: string,
  attempt: ResolveAttempt,
  usedMockLocation: boolean,
): Promise<string[]> {
  const uid = requireUid();
  const photoUrls = await uploadNewPhotos(attempt.photoUris, uid, challengeId);

  await setDoc(
    progressDoc(uid, challengeId),
    {
      status: "in_progress",
      locationVerified: attempt.locationVerified,
      usedMockLocation,
      photoUrls,
      answer: attempt.answer.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return photoUrls;
}

export async function completeChallenge(
  challenge: ChallengeData,
  attempt: ResolveAttempt,
  usedMockLocation: boolean,
): Promise<void> {
  const uid = requireUid();
  const missing = getMissingRequirements(attempt, challenge.answer);
  if (missing.length > 0) {
    throw new Error(missing.join("\n"));
  }

  const photoUrls = await uploadNewPhotos(attempt.photoUris, uid, challenge.id);

  await setDoc(
    progressDoc(uid, challenge.id),
    {
      status: "completed",
      locationVerified: true,
      usedMockLocation,
      photoUrls,
      answer: attempt.answer.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
