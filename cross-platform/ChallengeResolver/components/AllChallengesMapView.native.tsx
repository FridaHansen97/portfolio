// Requirement for Advanced-complexity extension: Map View - interactive map and user's real or simulated locations. Both mini-maps as part of other screens and the Map tab.
import MapZoomButtons from "@/components/MapZoomButtons";
import {
  AllChallengesMapViewProps,
  getRegionForChallenges,
  MapRegion,
} from "@/utils/mapUtils";
import { router } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MIN_DELTA = 0.002;
const MAX_DELTA = 40;

export default function AllChallengesMapView({
  challenges,
  className = "flex-1",
}: AllChallengesMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const initialRegion = getRegionForChallenges(challenges);

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

  const mapKey = challenges.map((challenge) => challenge.id).join(",");

  return (
    <View className={className}>
      <MapView
        key={mapKey}
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
        }}
      >
        {challenges.map((challenge) => (
          <Marker
            key={challenge.id}
            coordinate={challenge.target}
            pinColor="#C2410C"
            title={challenge.title}
            description={`Within ${challenge.radiusMeters} m · tap to open`}
            onCalloutPress={() =>
              router.push({
                pathname: "/challenge/[id]",
                params: { id: challenge.id },
              })
            }
          />
        ))}
      </MapView>
      <MapZoomButtons onZoomIn={() => zoom(0.5)} onZoomOut={() => zoom(2)} />
    </View>
  );
}
