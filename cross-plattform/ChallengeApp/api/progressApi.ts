// Reads and writes the signed-in user's progress. Each user has their own
// subcollection:  users/{uid}/progress/{challengeId}
// so one user's progress never overwrites another's (requirement 5).
import { uploadNewPhotos } from "@/api/imageApi";
import { auth, db } from "@/firebaseConfig";
import {
  ChallengeData,
  ChallengeProgress,
  ProgressStatus,
} from "@/utils/challengeData";
import { getMissingRequirements, ResolveAttempt } from "@/utils/challengeRules";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// Returns the signed-in user's uid, or throws — every progress call needs one
function requireUid(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");
  return user.uid;
}

// Path helpers so the paths are written in exactly one place
function progressCollection(uid: string) {
  return collection(db, "users", uid, "progress");
}

function progressDoc(uid: string, challengeId: string) {
  return doc(progressCollection(uid), challengeId);
}

// ---------- Reads ----------

// All of the user's progress in one query, keyed by challengeId.
// The overview uses this to show a status badge on every challenge
// without one request per challenge.
export async function getMyProgressMap(): Promise<
  Record<string, ChallengeProgress>
> {
  const snapshot = await getDocs(progressCollection(requireUid()));
  const map: Record<string, ChallengeProgress> = {};
  snapshot.docs.forEach((d) => {
    map[d.id] = d.data() as ChallengeProgress; // doc id === challengeId
  });
  return map;
}

// Progress for one challenge, or null if the user has never started it
export async function getMyProgress(
  challengeId: string,
): Promise<ChallengeProgress | null> {
  const snap = await getDoc(progressDoc(requireUid(), challengeId));
  return snap.exists() ? (snap.data() as ChallengeProgress) : null;
}

// "Not started" is never stored — no document means the user hasn't begun
export function getStatus(
  progress: ChallengeProgress | null | undefined,
): ProgressStatus {
  return progress?.status ?? "not_started";
}

// ---------- Writes ----------

// Marks the challenge as "in progress" once the user has verified their location.
// merge: true only updates these fields and keeps anything already stored
// (e.g. photos saved earlier).
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

// Saves an unfinished attempt ("Save progress" button) so the user can
// continue later, and so the list can show how far they have come.
// Returns the photo URLs so the screen can swap its local URIs for them
// and not upload the same photos again on the next save.
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

// Completes the challenge: checks the rules again, uploads any new photos to
// Storage, then saves the result. Photos are uploaded first so we never
// store a "completed" status without its evidence.
export async function completeChallenge(
  challenge: ChallengeData,
  attempt: ResolveAttempt,
  usedMockLocation: boolean,
): Promise<void> {
  const uid = requireUid();

  // Same rules as the screen. If someone bypasses the disabled button,
  // the save still refuses.
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
