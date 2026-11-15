// Web only: Google sends the browser back here after login. We read the id_token from the URL and either hand it back to the window that opened the popup, or sign in directly.
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { signInWithGoogleIdToken } from "@/api/authApi";
import { useEffect } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

export default function RedirectHandler() {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");
    if (!idToken) return;

    if (window.opener) {
      window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", idToken }, "*");
      window.close();
    } else {
      signInWithGoogleIdToken(idToken)
        .then(() => window.location.replace("/"))
        .catch((err) => console.error("Google sign-in failed:", err));
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-paper">
      <ActivityIndicator size="large" />
      <Text className="font-body text-muted">Completing login...</Text>
    </View>
  );
}
