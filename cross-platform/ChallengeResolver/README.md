# ChallengeResolver

Exam project in TDS200 Cross-platform
Built with Expo (SDK 58), Expo Router, Typescript, NativeWind, React Query and Firebase (Auth, firestore, Storage).

A location-based challengeApp. Find a challenge and prove you were there with a location, a photo, and answer the question this challenge has.

## Getting started

## Tested on

Web ----------------| yes | Chrome on macOS
iOS simulator ------| yes | iPhone 17 simulator
iOS physical iPhone | yes | Expo Go
Android emulator ---| no

### 1. install

run `npm install`

### 2. Envirement variables

The `.env` file is included in the hand-in. It needs these keys:

(`Expo_PUBLIC_FIREBASE_API_KEY`
`EXPO_PUBLIC_FIREBASE_APP_ID`
`EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
`EXPO_PUBLIC_FIREBASE_PROJECT_ID`
`EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
`EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
used to connect to firebase aswell as (`firebaseConfig.ts`))

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` For Google sign-in on web.
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` For Google sign-in on iOS.
`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` Map on web and street addresses.

The Maps key needs `Maps JavaScript API` and `Geocoding API` witch are enabled in the Google Cloud Console.

### 3. Run
This app is intended to run on iOS and web.

run `npm expo start`

press `w` to run in web or `i` to run in simulator.

Google sign in does not work on normal simulator to test this you can: 
build a development build with `npx expo prebuild --clean` and run `npx expo run:ios`

The port used for this project is 8081 and Google sign in redirects back to `http://127.0.0.1.8081/redirect`, so it will only work
when the project is run on its default port.

### Test user

To test the solution you can use testuser:
Email: `test@tester.no`
Password: `123456`

Or create a new account in the sign-in screen.

---

## Testing using mocl location (not walking around)

The soulution have a mock location to test the solution without having to accutually be at the challenge's location.
To use it, press `Testing tools mock location` that is folded just under the GPS button on Resolve screen.
Choose then between `At the target (inside radius)`, `x m away (inside radius)` and/or `x m away (outside radius)`.
You can also type coordinates by hand if you know your current position.

Inside the radius also means that step is now completed, but ouside the radius, the step stays open.

The test positions are calculated for each challenge's target and radius, so they also work for challenges made in the future.

## Requirements

1. Overview of all the challenges with the user's status: - `app(protected)/(tabs)/index.tsx`, `ChallengeCard`, `StatusBadge`
2. Challenge details: - `app/(protected)/challenge/[id].tsx`, `ChallengeDetailsView`
3. Resolve: location, photo and answer, photos uploded to storage: -
   `app/(protected)/resolve/[id].tsx`, `ResolveForm`, `LocationVerifier`, `ImageSelector`, `api/progressApi.ts`, `api/imageApi.ts`

4. Mock location: - `LocationVerifier`, `getMockTestLocation()` in `utils/locationUtils.ts`
5. Sign in and progress per user. (email/password and Google) - `app/auth.tsx`, `api/authApi.ts` - Firestore `users/{uid}/progress/{challengeId}`

## Extensions in functionality

1. Filter by status: `All`, `To Do`, `Started`, `Done` with counts of how many each. - `FilterChips`, `utils/challengeFilters.ts`
2. Save progress and finish later: `Save & exit` stores location, photos and/or answer. - `ProgressBar`, `saveProgressDraft()` in `api/progressApi.ts`
   There is also a progress bar on the list, detailsView and resolve screens to show how far you have come.

3. Multiple photos with rotate and crop to square functionality: - `ImageSelector`, using the `expo-image-manipulator` package.
4. Create, edit and delete your own challenges, with "use my location" and a slider for radius: -
   `ChallengeForm`, `app/(protected)/createChallenge.tsx`, `app/(protected)/editChallenge[id].tsx`

5. Maps: a full map with the target and radius circle on the details, resolve and create/edit screens. Tap expand button and the map expands almost to full screen.
   The `map tab` shows every challenge's location as a pin and if you click on the pin, you can select `Open challenge` and you are navigated to detailsView. -
   `ChallengeMapView` + `.native.tsx`, `ExpandableMapChallengeView.tsx`, `app/(protected)/(tabs)/mapScreen.tsx`

6. Street addresses: from the Google Geocoding API (falls back to coordinates). - `reverseGeoCode()` in `utils/locationUtils.ts`
7. Profile: Shows stats over challenges `Completed`, `In progress`, `Created`, and sign-out. - `app/(protected)/(tabs)/ProfilePage.tsx`, `ProfileView`
