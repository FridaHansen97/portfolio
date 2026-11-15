// Web implementation of ChallengeMapview.tsx using the Google Maps JavaScript API. Metro picks this file on web, ChallengeMapView.native.tsx on iOS and Android
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import MapZoomButtons from "@/components/MapZoomButtons";
import {
  ChallengeMapViewProps,
  getRegionForChallenge,
  regionToBounds,
} from "@/utils/mapUtils";
import { CircleF, GoogleMap, MarkerF } from "@react-google-maps/api";
import { useRef } from "react";
import { View } from "react-native";

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

export default function ChallengeMapView({
  target,
  radiusMeters,
  userLocation,
  className = "h-[240px] rounded-card",
}: ChallengeMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  function zoom(change: number) {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom() ?? 15;
    map.setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + change)));
  }

  // Google Maps uses { lat, lng }, react-native-maps uses { latitude, longitude }.
  const center = { lat: target.latitude, lng: target.longitude };

  // Same idea as the native file: a new key remounts the map when the target or the user's position changes, so it re-fits around both.
  const mapKey = [target, userLocation]
    .map((point) => (point ? `${point.latitude},${point.longitude}` : "none"))
    .join("|");

  return (
    <GoogleMapsLoader className={className}>
      <View className={`overflow-hidden bg-line ${className}`}>
        <GoogleMap
          key={mapKey}
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          // Our own + / − buttons replace Google's controls.
          options={{ disableDefaultUI: true, clickableIcons: false }}
          onLoad={(map) => {
            mapRef.current = map;
            map.fitBounds(
              regionToBounds(
                getRegionForChallenge(target, radiusMeters, userLocation),
              ),
              0,
            );
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
        >
          <MarkerF position={center} />
          <CircleF
            center={center}
            radius={radiusMeters}
            options={{
              strokeColor: "#C2410C",
              strokeWeight: 2,
              fillColor: "#C2410C",
              fillOpacity: 0.12,
              clickable: false,
            }}
          />

          {
            // The user's checked position as a dark dot (like the iOS map).
            userLocation && (
              <MarkerF
                position={{
                  lat: userLocation.latitude,
                  lng: userLocation.longitude,
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: "#17181A",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
              />
            )
          }
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
