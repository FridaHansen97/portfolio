// Web only: the component is used in ChallengeMapView.tsx and AllChallengesMapView.tsx which never load on iOS and Android.
// Loads the Google Maps JavaScript script once, shows a spinner while it's loading and an error if it fails. And only then the renders the map inside it.
// Both web maps go through it, so the script is always loaded with the same options.
// Requires Maps JavaScript API enabled in Google Cloud Console onxs the same EXPO_PUBLIC_GOOGLE_MAPS_API_KEY that is used for geocoding.
import { useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type GoogleMapsLoaderProps = {
  className: string; // Size and shape, so the spinner takes the same space as the map.
  children: ReactNode;
};

export default function GoogleMapsLoader({
  className,
  children,
}: GoogleMapsLoaderProps) {
  // Injects the script into the page the first time later calls with the same id reuse it.
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Failes if wrong key, API not enabled, or no network.
  if (loadError) {
    return (
      <View
        className={`items-center justify-center bg-surface p-6 ${className}`}
      >
        <Text className="text-center font-body text-sm text-danger-ink">
          Could not load Google Maps.
        </Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View
        className={`items-center justify-center gap-2 bg-surface ${className}`}
      >
        <ActivityIndicator size="large" />
        <Text className="font-body text-sm text-muted">Loading map...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
