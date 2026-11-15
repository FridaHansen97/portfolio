// Sign in / create account.
import {
  getSignInErrorMessage,
  getSignUpErrorMessage,
  signInWithEmail,
  signInWithGoogleIdToken,
  signUpWithEmail,
} from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { CircleAlert, Flag } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "signIn" | "signUp";

const GOOGLE_AVAILABLE = Platform.OS !== "android";

export default function AuthScreen() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  const iosRedirectUri = iosClientId
    ? makeRedirectUri({
        native: iosClientId.split(".").reverse().join(".") + ":/",
      })
    : undefined;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    iosClientId,
    redirectUri:
      Platform.OS === "web" ? "http://127.0.0.1:8081/redirect" : iosRedirectUri,
    responseType: Platform.OS === "web" ? "id_token" : "code",
    scopes: ["openid", "profile", "email"],
    extraParams: { promt: "select_account" },
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handlePopupMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.idToken) {
        signInWithGoogleIdToken(event.data.idToken).catch(() =>
          setError("Google sign in failed."),
        );
      }
    };

    window.addEventListener("message", handlePopupMessage);
    return () => window.removeEventListener("message", handlePopupMessage);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || response?.type !== "success") return;

    const idToken = response.authentication?.idToken;
    if (idToken) {
      signInWithGoogleIdToken(idToken).catch(() =>
        setError("Google sign in failed."),
      );
    } else {
      setError("Google sign-in failed: no ID token was returned.");
    }
  }, [response]);

  // Email/Password
  function switchMode(next: Mode) {
    setMode(next);
    setEmail("");
    setPassword("");
    setError(null);
  }

  function editField(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setError(null);
    };
  }

  function validateInput(): string | null {
    if (mode === "signUp" && !name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!password) return "Please enter your password.";
    if (mode === "signUp" && password.length < 6)
      return "Use at least 6 characters for the password.";
    return null;
  }

  async function handleSubmit() {
    const inputError = validateInput();
    if (inputError) {
      setError(inputError);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signIn") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, name.trim());
      }
    } catch (e) {
      //Not every error has a code, so it may be missing.
      const code = (e as { code?: string }).code ?? "";
      setError(
        mode === "signIn"
          ? getSignInErrorMessage(code)
          : getSignUpErrorMessage(code),
      );
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = mode === "signIn";

  //UI
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-paper">
      <ScrollView
        contentContainerClassName="flex-grow gap-5 px-6 pb-8 pt-10"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
      >
        <View className="h-14 w-14 items-center justify-center rounded-button bg-ink">
          <Flag size={26} color="#FFFFFF" />
        </View>

        <View className="gap-2">
          <Text className="font-display text-[34px] leading-10 text-ink">
            Find it. Prove it. {"\n"}Solve it.
          </Text>
          <Text className="font-body text-base text-muted">
            Location challenges made by people around you.
          </Text>
        </View>

        <View className="flex-row rounded-button bg-status-todo p-1">
          <ModeTab
            label="Sign in"
            selected={isSignIn}
            onPress={() => switchMode("signIn")}
          />
          <ModeTab
            label="Create account"
            selected={!isSignIn}
            onPress={() => switchMode("signUp")}
          />
        </View>

        <View className="gap-4">
          {!isSignIn && (
            <AuthField
              label="Name"
              value={name}
              onChangeText={editField(setName)}
              placeholder="Your name"
              autoComplete="name"
              textContentType="name"
            />
          )}
          <AuthField
            label="Email"
            value={email}
            onChangeText={editField(setEmail)}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <AuthField
            label="Password"
            value={password}
            onChangeText={editField(setPassword)}
            placeholder={isSignIn ? "Your password" : "At least 6 characters"}
            secureTextEntry
            autoComplete={isSignIn ? "current-password" : "new-password"}
            textContentType={isSignIn ? "password" : "newPassword"}
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
          />
        </View>

        {error && (
          <View
            className="flex-row gap-3 rounded-input bg-danger p-4"
            accessibilityRole="alert"
          >
            <CircleAlert size={18} color="#7A2508" />
            <Text className="flex-1 font-body text-sm text-danger-ink">
              {error}
            </Text>
          </View>
        )}

        <PrimaryButton onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-body-semibold text-base text-surface">
              {isSignIn ? "Sign in" : "Create account"}
            </Text>
          )}
        </PrimaryButton>

        {GOOGLE_AVAILABLE && (
          <>
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-line" />
              <Text className="font-body text-sm text-muted">or</Text>
              <View className="h-px flex-1 bg-line" />
            </View>
            <Pressable
              onPress={() => {
                setError(null);
                promptAsync();
              }}
              disabled={!request || loading}
              className={`h-[54px] flex-row items-center justify-center gap-3 rounded-button border border-line bg-surface ${
                !request ? "opacity-50" : "active:opacity-70"
              }`}
            >
              <View className="h-6 w-6 items-center justify-center rounded-md border border-line">
                <Text className="font-body-semibold text-xs text-ink">G</Text>
              </View>
              <Text className="font-body-semibold text-base text-ink">
                Continue with Google
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeTab({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-11 flex-1 items-center justify-center rounded-input ${selected ? "bg-surface" : ""}`}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text
        className={`font-body-semibold text-base ${selected ? "text-ink" : "text-muted"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AuthField({
  label,
  ...inputProps
}: TextInputProps & { label: string }) {
  return (
    <View className="gap-1.5">
      <Text className="font-body-semibold text-sm text-ink">{label}</Text>
      <TextInput
        className="h-[52px] w-full rounded-input border border-line bg-surface px-4 font-body text-base text-ink"
        placeholderTextColor="#55585E"
        {...inputProps}
      />
    </View>
  );
}

function PrimaryButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-[54px] items-center justify-center rounded-button bg-ink ${disabled ? "opacity-60" : "active:opacity-80"}`}
    >
      {children}
    </Pressable>
  );
}
