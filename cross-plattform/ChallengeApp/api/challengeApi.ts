// All Firestore reads/writes for the shared "challenges" collection.
import { auth, db } from "@/firebaseConfig";
import { ChallengeData, NewChallengeData } from "@/utils/challengeData";
import { isValidCoords } from "@/utils/locationUtils";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const CHALLENGES_COLLECTION = "challenges";

// Checks the form data before it reaches Firestore.
// Returns a user-friendly message, or null if everything is valid.
export function validateChallenge(data: NewChallengeData): string | null {
  if (!data.title.trim()) return "Title is required.";
  if (!data.description.trim()) return "Description is required.";
  if (!data.question.trim()) return "Question is required.";
  if (!data.answer.trim()) return "Answer is required.";
  if (!isValidCoords(data.target.latitude, data.target.longitude)) {
    return "Enter a valid latitude (-90 to 90) and longitude (-180 to 180).";
  }
  if (Number.isNaN(data.radiusMeters) || data.radiusMeters <= 0) {
    return "Radius must be a positive number of meters.";
  }
  return null;
}

// Creates a challenge owned by the signed-in user. Returns the new document id.
export async function createChallenge(data: NewChallengeData): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to create a challenge.");

  const validationError = validateChallenge(data);
  if (validationError) throw new Error(validationError);

  const ref = await addDoc(collection(db, CHALLENGES_COLLECTION), {
    ...data,
    title: data.title.trim(),
    answer: data.answer.trim(),
    authorId: user.uid, // from auth, not from the form
    authorName: user.displayName ?? user.email ?? "Anonymous",
    createdAt: serverTimestamp(), // server clock, not the phone's
  });
  return ref.id;
}

// Fetches every challenge, newest first. Challenges are shared by all users.
export async function getAllChallenges(): Promise<ChallengeData[]> {
  const snapshot = await getDocs(
    query(collection(db, CHALLENGES_COLLECTION), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ChallengeData);
}

// Fetches a single challenge, or null if it doesn't exist (e.g. deleted).
export async function getChallengeById(
  id: string,
): Promise<ChallengeData | null> {
  const snap = await getDoc(doc(db, CHALLENGES_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ChallengeData;
}
