// Uploads evidence photos to Firebase Storage.
import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Photos that were saved earlier are already https:// download URLs.
// New photos are local: file:// on native, blob: or data: on web.
export function isUploaded(uri: string): boolean {
  return uri.startsWith("https://") || uri.startsWith("http://");
}

// Uploads one local image and returns its public download URL,
// which is what we store in Firestore.
//
// Path: evidence/{userId}/{challengeId}/{timestamp}_{index}.jpg
// - userId first, so Storage rules can say "only the owner may write here"
// - challengeId groups all photos for one attempt
// - timestamp + index keep file names unique across several saves
export async function uploadEvidenceImage(
  localUri: string,
  userId: string,
  challengeId: string,
  index: number,
): Promise<string> {
  // fetch() can read local file URIs on both native and web and turn them into a Blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  const path = `evidence/${userId}/${challengeId}/${Date.now()}_${index}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
}

// Uploads only the photos that aren't in Storage yet and keeps the order.
// Saving twice therefore never uploads the same photo twice.
export async function uploadNewPhotos(
  uris: string[],
  userId: string,
  challengeId: string,
): Promise<string[]> {
  return Promise.all(
    uris.map((uri, index) =>
      isUploaded(uri)
        ? Promise.resolve(uri)
        : uploadEvidenceImage(uri, userId, challengeId, index),
    ),
  );
}
