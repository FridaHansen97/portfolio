// Shared by all the map components. Each map has two files, the native.tsx for iOS/Android and .tsx for web.
// Both versions take the same props (defined once here), so the screens can import ChallengeMapView without caring which platform they run on.
import { ChallengeData } from "@/utils/challengeData";
import { Coords } from "@/utils/locationUtils";

export type ChallengeMapViewProps = {
  target: Coords;
  radiusMeters: number;
  userLocation?: Coords | null;
  className?: string;
};

export type AllChallengesMapViewProps = {
  challenges: ChallengeData[];
  className?: string;
};

export interface MapRegion extends Coords {
  latitudeDelta: number;
  longitudeDelta: number;
}

// Only shown when there are no challenges yet.
const DEFAULT_REGION: MapRegion = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const METERS_PER_DEGREE_LATITUDE = 111320;

function getRegionForPoints(points: Coords[], minDelta: number): MapRegion {
  if (points.length === 0) return DEFAULT_REGION;

  const latitudes = points.map((p) => p.latitude);
  const longitudes = points.map((p) => p.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * 1.5, minDelta);
  const longitudeDelta = Math.max(
    (maxLng - minLng) * 1.5,
    minDelta / Math.cos((latitude * Math.PI) / 180),
  );

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

export function getRegionForChallenge(
  target: Coords,
  radiusMeters: number,
  userLocation?: Coords | null,
): MapRegion {
  const circleDelta = (radiusMeters * 2 * 2.5) / METERS_PER_DEGREE_LATITUDE;
  const points = userLocation ? [target, userLocation] : [target];
  return getRegionForPoints(points, Math.max(circleDelta, 0.002));
}

export function getRegionForChallenges(challenges: ChallengeData[]): MapRegion {
  return getRegionForPoints(
    challenges.map((challenge) => challenge.target),
    0.02,
  );
}

export function regionToBounds(region: MapRegion) {
  return {
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  };
}
