// Uploads evidence photos to Firebase Storage.
import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export function isUploaded(uri: string): boolean {
  return uri.startsWith("https://") || uri.startsWith("http://");
}

//Uploads one local image and returns its public download URL that we store in firestore.
export async function uploadEvidenceImage(
  localUri: string,
  userId: string,
  challengeId: string,
  index: number,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const path = `evidence/${userId}/${challengeId}/${Date.now()}_${index}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, { contentType: "image/jpg" });
  return getDownloadURL(storageRef);

  //Uploads only the photos that aren´t in storage yet and keeps the order..therfor never uploads the same photo twice
}

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
