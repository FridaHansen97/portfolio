// Everything location related - reading GPS, mock locations, reverse geocoding, and measuring the distance to a challenge's target.
import * as Location from "expo-location";

// Types
export interface Coords {
  latitude: number;
  longitude: number;
}

export interface ResolvedLocation extends Coords {
  address: string;
}

// Requirement 4: A predefined test location for Mock location mode.
export interface MockTestLocation {
  label: string;
  coords: Coords;
}

// Errors
export class LocationPermissionDeniedError extends Error {
  constructor() {
    super("Location permission denied. Enable it in your device settings.");
    this.name = "LocationPermissionDeniedError";
  }
}

export class LocationUnavaliableError extends Error {
  constructor(
    message = "Your position could not be found. Check that location services are turned on for this app or browser.",
  ) {
    super(message);
    this.name = "LocationUnavailableError";
  }
}

function toLocationError(error: unknown): Error {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 1) return new LocationPermissionDeniedError();
  if (code === 3) {
    return new LocationUnavaliableError(
      "Finding your position took too long. Please try again.",
    );
  }
  return new LocationUnavaliableError();
}

export class InvalidCoordinatesError extends Error {
  constructor() {
    super("Enter a valid latitude (-90 to 90) and longitude (-180 to 180.");
    this.name = "InvalidCoordinatesError";
  }
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return formatCoordinates(latitude, longitude);
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address as string;
    }
  } catch {
    // Network error
  }
  return formatCoordinates(latitude, longitude);
}

// Rading a location
export async function getCurrentLocation(): Promise<ResolvedLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new LocationPermissionDeniedError();
  }

  let position: Location.LocationObject;
  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (error) {
    const { code, message } = (error ?? {}) as {
      code?: unknown;
      message?: unknown;
    };
    console.warn("getCurrentPositionAsync failed:", { code, message });
    throw toLocationError(error);
  }
  const { latitude, longitude } = position.coords;
  const address = await reverseGeocode(latitude, longitude);

  return { latitude, longitude, address };
}

export function isValidCoords(latitude: number, longitude: number): boolean {
  return (
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// Mock location: uses coordinates typed in by hand instead of GPS.
export async function getMockLocation(
  latitude: number,
  longitude: number,
): Promise<ResolvedLocation> {
  if (!isValidCoords(latitude, longitude)) {
    throw new InvalidCoordinatesError();
  }
  const address = await reverseGeocode(latitude, longitude);
  return { latitude, longitude, address };
}

// Distance
const EARTH_RADIUS_METERS = 6371000;
const METERS_PER_DEGREE_LATITUDE = 111320;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceInMeters(from: Coords, to: Coords): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

// Mock test locations
export function getMockTestLocations(
  target: Coords,
  radiusMeters: number,
): MockTestLocation[] {
  const metersToLatitude = (meters: number) =>
    meters / METERS_PER_DEGREE_LATITUDE;

  return [
    {
      label: "At the target (inside radius)",
      coords: { ...target },
    },
    {
      label: `${Math.round(radiusMeters / 2)} m away (inside radius)`,
      coords: {
        latitude: target.latitude + metersToLatitude(radiusMeters / 2),
        longitude: target.longitude,
      },
    },
    {
      label: `${Math.round(radiusMeters * 3)} m away (outside radius)`,
      coords: {
        latitude: target.latitude + metersToLatitude(radiusMeters * 3),
        longitude: target.longitude,
      },
    },
  ];
}
