// Location step of the Resolve screen (requirement 4).
//  - Main button: reads the device's real GPS position
//  - "Testing tools · mock location" (folded away): predefined test locations
//    inside/outside the radius, or coordinates typed by hand — lets the
//    examiner test on web and simulators
// Either way the result is compared with the challenge's target and radius,
// shown on a distance bar, and reported to the parent through onResult.
import {
  Coords,
  distanceInMeters,
  getCurrentLocation,
  getMockLocation,
  getMockTestLocations,
  ResolvedLocation,
} from "@/utils/locationUtils";
import { ChevronDown, ChevronRight, LocateFixed } from "lucide-react-native";
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

type LocationVerifierProps = {
  target: Coords;
  radiusMeters: number;
  result: LocationCheck | null;
  onResult: (check: LocationCheck) => void;
  disabled?: boolean;
};

// "18 m" below 1 km, "1.2 km" above
export function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

export default function LocationVerifier({
  target,
  radiusMeters,
  result,
  onResult,
  disabled = false,
}: LocationVerifierProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTestingTools, setShowTestingTools] = useState(false);
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
    // Accept "59,91" as well as "59.91"; NaN is rejected by getMockLocation
    const lat = parseFloat(manualLat.replace(",", "."));
    const lng = parseFloat(manualLng.replace(",", "."));
    check(() => getMockLocation(lat, lng), true);
  }

  const isBusy = disabled || loading;

  return (
    <View className="gap-3">
      {result && (
        <DistanceBar
          distance={result.distanceMeters}
          radius={radiusMeters}
          isInside={result.isInside}
        />
      )}
      {result?.usedMockLocation && (
        <Text className="font-body text-xs text-muted">
          Using a mock location
        </Text>
      )}

      {error && (
        <Text className="font-body text-sm text-danger-ink">{error}</Text>
      )}

      {/* Main action: real GPS. Outlined once there is a result ("Check again") */}
      <Pressable
        onPress={() => check(getCurrentLocation, false)}
        disabled={isBusy}
        className={`h-12 flex-row items-center justify-center gap-2 rounded-button ${
          result ? "border border-line bg-surface" : "bg-ink"
        } ${isBusy ? "opacity-60" : "active:opacity-80"}`}
      >
        {loading ? (
          <ActivityIndicator color={result ? "#17181A" : "#FFFFFF"} />
        ) : (
          <>
            {!result && <LocateFixed size={18} color="#FFFFFF" />}
            <Text
              className={`font-body-semibold text-base ${result ? "text-ink" : "text-surface"}`}
            >
              {result ? "Check again" : "Use my location"}
            </Text>
          </>
        )}
      </Pressable>

      {/* Testing tools — folded away so normal users aren't distracted by them */}
      <View className="border-t border-dashed border-line pt-3">
        <Pressable
          onPress={() => setShowTestingTools((open) => !open)}
          className="flex-row items-center gap-1"
          accessibilityRole="button"
          accessibilityState={{ expanded: showTestingTools }}
        >
          {showTestingTools ? (
            <ChevronDown size={16} color="#55585E" />
          ) : (
            <ChevronRight size={16} color="#55585E" />
          )}
          <Text className="font-body-semibold text-sm text-muted">
            Testing tools · mock location
          </Text>
        </Pressable>

        {showTestingTools && (
          <View className="mt-3 gap-2">
            {testLocations.map((option) => (
              <Pressable
                key={option.label}
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
                disabled={isBusy}
                className="rounded-input border border-line bg-paper px-4 py-3 active:bg-line/40"
              >
                <Text className="font-body text-sm text-ink">
                  {option.label}
                </Text>
              </Pressable>
            ))}

            <View className="mt-1 flex-row gap-2">
              {/* Wrapped in a flex-1 View: on web a TextInput has a minimum width
                  and would push past the card edge with flex-1 alone */}
              <View className="flex-1">
                <TextInput
                  className="h-11 w-full rounded-input border border-line bg-surface px-3 font-mono text-sm text-ink"
                  placeholder="Latitude"
                  placeholderTextColor="#55585E"
                  keyboardType="numbers-and-punctuation"
                  value={manualLat}
                  onChangeText={setManualLat}
                  editable={!isBusy}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="h-11 w-full rounded-input border border-line bg-surface px-3 font-mono text-sm text-ink"
                  placeholder="Longitude"
                  placeholderTextColor="#55585E"
                  keyboardType="numbers-and-punctuation"
                  value={manualLng}
                  onChangeText={setManualLng}
                  editable={!isBusy}
                />
              </View>
            </View>
            <Pressable
              onPress={handleManualCheck}
              disabled={isBusy}
              className="h-11 items-center justify-center rounded-button border border-line bg-surface active:opacity-70"
            >
              <Text className="font-body-semibold text-sm text-ink">
                Check these coordinates
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// Horizontal bar: green zone up to the radius, an orange tick at the limit,
// and a dot showing where the user is. Distances beyond the scale stick to the end.
function DistanceBar({
  distance,
  radius,
  isInside,
}: {
  distance: number;
  radius: number;
  isInside: boolean;
}) {
  // The radius sits at ~60% of the bar, leaving room to show "a bit outside"
  const scaleMax = radius / 0.6;
  const dotPercent = Math.min(distance / scaleMax, 1) * 100;
  const limitPercent = 60;

  return (
    <View className="gap-2">
      <View className="h-4 justify-center">
        <View className="h-2 overflow-hidden rounded-full bg-line">
          <View
            className="h-full bg-status-done"
            style={{ width: `${limitPercent}%` }}
          />
        </View>
        {/* Limit marker */}
        <View
          className="absolute h-5 w-0.5 bg-target"
          style={{ left: `${limitPercent}%` }}
        />
        {/* User position; marginLeft centers the 16px dot on the exact spot */}
        <View
          className={`absolute h-4 w-4 rounded-full border-2 border-surface ${
            isInside ? "bg-status-done-ink" : "bg-target"
          }`}
          style={{ left: `${dotPercent}%`, marginLeft: -8 }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="font-body text-sm text-muted">
          <Text
            className={`font-body-semibold ${isInside ? "text-status-done-ink" : "text-target"}`}
          >
            {formatDistance(distance)}
          </Text>{" "}
          from target
        </Text>
        <Text className="font-body text-sm text-muted">
          limit {formatDistance(radius)}
        </Text>
      </View>
    </View>
  );
}
