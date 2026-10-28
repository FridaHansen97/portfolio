// Task 4, Location step of the Resolve screen.
// Two modes:
//  - GPS:  reads the device's real position
//  - Mock: the examiner picks a predefined test location (inside / outside the
//          radius) or types coordinates by hand — works on web and simulators
// Either way the result is compared with the challenge's target and radius,
// and reported to the parent through onResult.
import {
    Coords,
    distanceInMeters,
    getCurrentLocation,
    getMockLocation,
    getMockTestLocations,
    ResolvedLocation,
} from "@/utils/locationUtils";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

// What the parent gets back after every check
export interface LocationCheck {
  location: ResolvedLocation;
  distanceMeters: number;
  isInside: boolean;
  usedMockLocation: boolean;
}

type Mode = "gps" | "mock";

type LocationVerifierProps = {
  target: Coords;
  radiusMeters: number;
  result: LocationCheck | null;
  onResult: (check: LocationCheck) => void;
  disabled?: boolean;
};

export default function LocationVerifier({
  target,
  radiusMeters,
  result,
  onResult,
  disabled = false,
}: LocationVerifierProps) {
  const [mode, setMode] = useState<Mode>("gps");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  // Predefined test locations built from this challenge's own target/radius
  const testLocations = getMockTestLocations(target, radiusMeters);

  // Shared by all three ways of getting a location: runs the async lookup,
  // compares the result with the target, and handles loading + errors once.
  async function check(
    getLocation: () => Promise<ResolvedLocation>,
    usedMockLocation: boolean,
  ) {
    setError(null);
    setLoading(true);
    try {
      const location = await getLocation();
      const distance = distanceInMeters(location, target);
      onResult({
        location,
        distanceMeters: distance,
        isInside: distance <= radiusMeters,
        usedMockLocation,
      });
    } catch (e) {
      // The custom errors in locationUtils already have user-friendly messages
      setError(e instanceof Error ? e.message : "Could not get a location.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualCheck() {
    // parseFloat("") is NaN, which getMockLocation rejects with a clear message
    check(
      () => getMockLocation(parseFloat(manualLat), parseFloat(manualLng)),
      true,
    );
  }

  return (
    <View className="gap-3">
      {/* Mode switch */}
      <View className="flex-row rounded-lg bg-gray-200 p-1">
        {(["gps", "mock"] as const).map((m) => (
          <Pressable
            key={m}
            className={`flex-1 items-center rounded-md py-2 ${mode === m ? "bg-white" : ""}`}
            onPress={() => setMode(m)}
            disabled={disabled}
          >
            <Text
              className={
                mode === m ? "font-semibold text-blue-500" : "text-gray-500"
              }
            >
              {m === "gps" ? "📍 GPS" : "🧪 Mock location"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "gps" ? (
        <Pressable
          className="items-center rounded-lg bg-blue-500 py-3 active:opacity-70"
          onPress={() => check(getCurrentLocation, false)}
          disabled={disabled || loading}
        >
          <Text className="font-semibold text-white">
            Use my current location
          </Text>
        </Pressable>
      ) : (
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase text-gray-400">
            Test locations
          </Text>
          {testLocations.map((option) => (
            <Pressable
              key={option.label}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 active:bg-gray-100"
              onPress={() =>
                check(
                  () =>
                    getMockLocation(
                      option.coords.latitude,
                      option.coords.longitude,
                    ),
                  true,
                )
              }
              disabled={disabled || loading}
            >
              <Text>{option.label}</Text>
            </Pressable>
          ))}

          <Text className="mt-2 text-xs font-semibold uppercase text-gray-400">
            Or enter coordinates
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
              placeholder="Latitude"
              keyboardType="numbers-and-punctuation"
              value={manualLat}
              onChangeText={setManualLat}
              editable={!disabled}
            />
            <TextInput
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
              placeholder="Longitude"
              keyboardType="numbers-and-punctuation"
              value={manualLng}
              onChangeText={setManualLng}
              editable={!disabled}
            />
          </View>
          <Pressable
            className="items-center rounded-lg bg-gray-700 py-3 active:opacity-70"
            onPress={handleManualCheck}
            disabled={disabled || loading}
          >
            <Text className="font-semibold text-white">
              Check these coordinates
            </Text>
          </Pressable>
        </View>
      )}

      {loading && <ActivityIndicator />}
      {error && <Text className="text-red-600">{error}</Text>}

      {/* Result of the latest check */}
      {result && !loading && (
        <View
          className={`rounded-lg p-3 ${result.isInside ? "bg-green-100" : "bg-red-100"}`}
        >
          <Text
            className={`font-semibold ${result.isInside ? "text-green-800" : "text-red-800"}`}
          >
            {result.isInside
              ? "✓ You are inside the target area"
              : "✗ You are outside the target area"}
          </Text>
          <Text className="text-sm text-gray-700">
            {Math.round(result.distanceMeters)} m from the target (limit{" "}
            {radiusMeters} m)
          </Text>
          <Text className="text-xs text-gray-500">
            {result.location.address}
            {result.usedMockLocation ? " · mock location" : ""}
          </Text>
        </View>
      )}
    </View>
  );
}
