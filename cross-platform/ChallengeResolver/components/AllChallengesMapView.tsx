// Requirement for Advanced-complexity extension: Map View - interactive map and user's real or simulated locations. Both mini-maps as part of other screens and the Map tab.
// Implementation of the map on web using the Google Maps JavaScript API. Metro picks this file on web, AllChallengesMapView.native.tsx on iOS and Android.
// regionToBounds() so web zooms the exact same area as iOS.
// GoogleMapsLoader, the shared script loading, instead of the codebase from lecture duplicate in both web files.
// MapZoomButtons instead of Google's own controls(disableDefaultUI: true).
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import MapZoomButtons from "@/components/MapZoomButtons";
import {
  AllChallengesMapViewProps,
  getRegionForChallenges,
  regionToBounds,
} from "@/utils/mapUtils";
import { GoogleMap, InfoWindowF, MarkerF } from "@react-google-maps/api";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

export default function AllChallengesMapView({
  challenges,
  className = "flex-1",
}: AllChallengesMapViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeChallenge = challenges.find(
    (challenge) => challenge.id === activeId,
  );

  const mapRef = useRef<google.maps.Map | null>(null);

  function zoom(delta: number) {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom() ?? 12;
    map.setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta)));
  }

  const mapKey = challenges.map((challenge) => challenge.id).join(",");

  return (
    <GoogleMapsLoader className={className}>
      <View className={className}>
        <GoogleMap
          key={mapKey}
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 59.9139, lng: 10.7522 }}
          zoom={12}
          options={{ disableDefaultUI: true, clickableIcons: false }}
          onLoad={(map) => {
            mapRef.current = map;
            map.fitBounds(
              regionToBounds(getRegionForChallenges(challenges)),
              0,
            );
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          onClick={() => setActiveId(null)}
        >
          {challenges.map((challenge) => (
            <MarkerF
              key={challenge.id}
              position={{
                lat: challenge.target.latitude,
                lng: challenge.target.longitude,
              }}
              title={challenge.title}
              onClick={() => setActiveId(challenge.id)}
            />
          ))}

          {activeChallenge && (
            <InfoWindowF
              position={{
                lat: activeChallenge.target.latitude,
                lng: activeChallenge.target.longitude,
              }}
              onCloseClick={() => setActiveId(null)}
            >
              <View className="gap-1 p-1">
                <Text className="font-body-semibold text-sm text-ink">
                  {activeChallenge.title}
                </Text>
                <Text className="font-body text-xs text-muted">
                  Within {activeChallenge.radiusMeters} m
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/challenge/[id]",
                      params: { id: activeChallenge.id },
                    })
                  }
                  className="mt-1"
                >
                  <Text className="font-body-semibold text-sm text-target">
                    Open challenge
                  </Text>
                </Pressable>
              </View>
            </InfoWindowF>
          )}
        </GoogleMap>

        <MapZoomButtons onZoomIn={() => zoom(1)} onZoomOut={() => zoom(-1)} />
      </View>
    </GoogleMapsLoader>
  );
}

const mapContainerStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
