// All Firestore reads/writes for the shared "challenges" collection.
import { auth, db } from "@/firebaseConfig";
import { ChallengeData, NewChallengeData } from "@/utils/challengeData";
import { isValidCoords } from "@/utils/locationUtils";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const CHALLENGES_COLLECTION = "challenges";

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

export async function createChallenge(data: NewChallengeData): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to create a challenge.");

  const validationError = validateChallenge(data);
  if (validationError) throw new Error(validationError);

  const ref = await addDoc(collection(db, CHALLENGES_COLLECTION), {
    ...data,
    title: data.title.trim(),
    answer: data.answer.trim(),
    authorId: user.uid,
    authorName: user.displayName ?? user.email ?? "Anonymous",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllChallenges(): Promise<ChallengeData[]> {
  const snapshot = await getDocs(
    query(collection(db, CHALLENGES_COLLECTION), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ChallengeData,
  );
}

export async function getChallengeById(
  id: string,
): Promise<ChallengeData | null> {
  const snap = await getDoc(doc(db, CHALLENGES_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ChallengeData;
}

async function requireOwnChallenge(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to change a challenge.");

  const snap = await getDoc(doc(db, CHALLENGES_COLLECTION, id));
  if (!snap.exists()) throw new Error("This challenge no longer exists.");
  if (snap.data().authorId !== user.uid) {
    throw new Error("You can only change challenges made by yourself.");
  }
}

export async function updateChallenge(
  id: string,
  data: NewChallengeData,
): Promise<void> {
  const validationError = validateChallenge(data);
  if (validationError) throw new Error(validationError);
  await requireOwnChallenge(id);

  await updateDoc(doc(db, CHALLENGES_COLLECTION, id), {
    ...data,
    title: data.title.trim(),
    answer: data.answer.trim(),
    category: data.category ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChallenge(id: string): Promise<void> {
  await requireOwnChallenge(id);
  await deleteDoc(doc(db, CHALLENGES_COLLECTION, id));
}
