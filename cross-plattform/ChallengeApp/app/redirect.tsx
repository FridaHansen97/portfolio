// Web only: Google sends the browser back here after login (redirect URI
// http://127.0.0.1:8081/redirect). We read the id_token from the URL and
// either hand it back to the window that opened the popup, or sign in directly.
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession(); // must run before anything else

import { signInWithGoogleIdToken } from "@/api/authApi";
import { useEffect } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

export default function RedirectHandler() {
  useEffect(() => {
    // This route only makes sense in a browser — window does not exist on native
    if (Platform.OS !== "web") return;

    // Google puts the token in the URL hash: #id_token=...&...
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");
    if (!idToken) return;

    if (window.opener) {
      // Opened as a popup: send the token to the main window (auth.tsx listens) and close
      window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", idToken }, "*");
      window.close();
    } else {
      // Opened in the same tab: sign in here, then go to the app
      signInWithGoogleIdToken(idToken)
        .then(() => window.location.replace("/"))
        .catch((err) => console.error("Google sign-in failed:", err));
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="large" />
      <Text className="text-gray-500">Completing login…</Text>
    </View>
  );
}
