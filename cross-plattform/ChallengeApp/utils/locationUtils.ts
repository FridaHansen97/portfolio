// Everything location-related: reading GPS, mock locations for testing,
// reverse geocoding, and checking whether the user is inside a challenge radius.
import * as Location from "expo-location";

// ---------- Types ----------

// A point on the map. Used both for the user's position and a challenge's target.
export interface Coords {
  latitude: number;
  longitude: number;
}

// A GPS position plus a human-readable address (from reverse geocoding)
export interface ResolvedLocation extends Coords {
  address: string;
}

// A predefined test location for Mock Location mode (requirement 4)
export interface MockTestLocation {
  label: string;
  coords: Coords;
}

// ---------- Errors ----------

// Custom error classes let the UI show a specific message for each failure
export class LocationPermissionDeniedError extends Error {
  constructor() {
    super("Location permission denied. Enable it in your device settings.");
    this.name = "LocationPermissionDeniedError";
  }
}

// GPS is allowed but no position could be found (location services off,
// no signal, or it took too long)
export class LocationUnavailableError extends Error {
  constructor(
    message = "Your position could not be found. Check that location services are turned on for this app or browser.",
  ) {
    super(message);
    this.name = "LocationUnavailableError";
  }
}

// The browser rejects with a GeolocationPositionError ({ code, message }), which
// is NOT an Error instance, while iOS/Android reject with a normal Error.
// Both are turned into one of our own errors with a message the user understands.
// Browser codes: 1 = permission denied, 2 = position unavailable, 3 = timeout.
function toLocationError(error: unknown): Error {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 1) return new LocationPermissionDeniedError();
  if (code === 3) {
    return new LocationUnavailableError(
      "Finding your position took too long. Please try again.",
    );
  }
  return new LocationUnavailableError();
}

export class InvalidCoordinatesError extends Error {
  constructor() {
    super("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
    this.name = "InvalidCoordinatesError";
  }
}

// ---------- Reverse geocoding ----------

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

// Turns coordinates into an address using the Google Geocoding API.
// Works the same on iOS, Android and web (expo-location's own geocoder does not
// work on web). Falls back to plain coordinates if the API key is missing or the
// request fails, so a geocoding problem never blocks the user.
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
    // Network error — fall through to the coordinate fallback
  }
  return formatCoordinates(latitude, longitude);
}

// ---------- Reading a location ----------

// Real GPS: asks for permission, reads the device position, adds an address.
export async function getCurrentLocation(): Promise<ResolvedLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new LocationPermissionDeniedError();
  }

  let position: Location.LocationObject;
  try {
    position = await Location.getCurrentPositionAsync({});
  } catch (error) {
    // Log code + message explicitly: the browser's error object keeps them on
    // its prototype, so logging the object itself just prints "{}".
    // console.warn (not error) so Expo doesn't show a full-screen red error
    // for something the UI already explains to the user.
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

// Returns true if both numbers are valid GPS coordinates
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
// No permission or GPS fix needed — lets the examiner test on a simulator/web.
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

// ---------- Distance ----------

const EARTH_RADIUS_METERS = 6371000;
const METERS_PER_DEGREE_LATITUDE = 111320; // roughly constant everywhere on Earth

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Haversine formula: straight-line distance in meters between two GPS points,
// treating the Earth as a sphere (error < 0.5%, fine for radii of a few hundred meters).
export function distanceInMeters(from: Coords, to: Coords): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  // h = haversine of the central angle between the two points
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  // Central angle (radians) × Earth radius = distance along the surface
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

// True when the user is inside the challenge's completion radius
export function isWithinRadius(
  user: Coords,
  target: Coords,
  radiusMeters: number,
): boolean {
  return distanceInMeters(user, target) <= radiusMeters;
}

// ---------- Mock test locations ----------

// Builds the dropdown options for Mock Location mode from the challenge itself,
// so they work for any challenge — including ones the examiner creates.
// Moving north only changes latitude, and 1° of latitude ≈ 111 km everywhere,
// which makes the offset easy to compute.
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
