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

//Returns the signed-in users uid, or throws. every progress call needs one.
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

//              Reads
//All the users progress in one query. The overview uses this to show a status badge on every challenge.
export async function getMyProgressMap(): Promise<
  Record<string, ChallengeProgress>
> {
  const snapshot = await getDocs(progressCollection(requireUid()));
  const map: Record<string, ChallengeProgress> = {};
  snapshot.docs.forEach((d) => {
    map[d.id] = d.data() as ChallengeProgress;
  });
  return map;
}

//Progress for one challenge, or nyll if the user never has started it.
export async function getMyProgress(
  challengeId: string,
): Promise<ChallengeProgress | null> {
  const snap = await getDoc(progressDoc(requireUid(), challengeId));
  return snap.exists() ? (snap.data() as ChallengeProgress) : null;
}

//Not started is never stored. no document means the yser has not started.
export function getStatus(
  progress: ChallengeProgress | null | undefined,
): ProgressStatus {
  return progress?.status ?? "not_started";
}

//            Writes
//Marks the challenge as "in progress" as soon as the user has verified their location.
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

//Saves an unfinished attempt so the user can continue later and so the list can show how far they have gotten.

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

//Completes the challenge: checks rules again, uploads new photos and saves.
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
