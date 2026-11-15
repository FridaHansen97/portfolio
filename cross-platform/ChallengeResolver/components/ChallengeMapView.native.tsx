// Loaded only on iOS and Android. Metro picks ChallengeMapView.native.tsx on native, ChallengeMapView.tsx on web. iOS shows Apple Maps, which dont need a API.
import MapZoomButtons from "@/components/MapZoomButtons";
import {
  ChallengeMapViewProps,
  getRegionForChallenge,
  MapRegion,
} from "@/utils/mapUtils";
import { useRef } from "react";
import { View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

// Smaller delta = more zoomed in. Each button press halves the delta.
const MIN_DELTA = 0.002;
const MAX_DELTA = 40;

export default function ChallengeMapView({
  target,
  radiusMeters,
  userLocation,
  className = "h-[240px] rounded-card",
}: ChallengeMapViewProps) {
  const mapRef = useRef<MapView>(null);

  const initialRegion = getRegionForChallenge(
    target,
    radiusMeters,
    userLocation,
  );

  // What the map shows a this moment, updated after every zoom so the buttons zoom around where the user is looking, insted of back at the target.
  const regionRef = useRef<MapRegion>(initialRegion);

  function zoom(factor: number) {
    const current = regionRef.current;
    const clamp = (delta: number) =>
      Math.min(MAX_DELTA, Math.max(MIN_DELTA, delta * factor));
    mapRef.current?.animateToRegion(
      {
        ...current,
        latitudeDelta: clamp(current.latitudeDelta),
        longitudeDelta: clamp(current.longitudeDelta),
      },
      200,
    );
  }

  // InitialRegion is only used when the map first mounts. Changing the key when the target moves or the user checks a new position remounts the map so it re-fits around both.
  const mapKey = [target, userLocation]
    .map((point) => (point ? `${point.latitude},${point.longitude}` : "none"))
    .join("|");

  return (
    <View className={`overflow-hidden bg-line ${className}`}>
      <MapView
        key={mapKey}
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
        }}
      >
        <Marker coordinate={target} pinColor="#C2410C" />
        <Circle
          center={target}
          radius={radiusMeters}
          strokeColor="#C2410C"
          strokeWidth={2}
          fillColor="rgba(194, 65, 12, 0.12)"
        />
        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View className="h-4 w-4 rounded-full border-2 border-surface bg-ink" />
          </Marker>
        )}
      </MapView>
      <MapZoomButtons onZoomIn={() => zoom(0.5)} onZoomOut={() => zoom(2)} />
    </View>
  );
}
