// Proof for photos: Shown as a grid of tiles with an "Add" tile at the end. Add - lets the user's pick the camera or the photo library.
// Tapping a tile selects it, so that it can be rotated, cropped to square or deleted.
// Got help by claude AI to understand how to do the "save and quit".
import { isUploaded } from "@/api/imageApi";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Crop,
  Images,
  Plus,
  RotateCw,
  SwitchCamera,
  Trash,
  X,
} from "lucide-react-native";
import { ReactNode, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ImageSelectorProps = {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
};

// Every captured or edited photo is saved with the same settings, keeping the files small so they upload quickly.
const SAVE_OPTIONS = { compress: 0.85, format: SaveFormat.JPEG };
// The iOS simulator and Android emulator have no camera, so the camera is turned off there. Web is left out of the check because Device.isDevice is always true in a browser.
const IS_SIMULATOR = Platform.OS !== "web" && !Device.isDevice;

export default function ImageSelector({
  images,
  onChange,
  disabled = false,
}: ImageSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [choosingSource, setChoosingSource] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const selectedUri =
    selectedIndex !== null ? images[selectedIndex] : undefined;

  // Adding photos
  async function pickFromLibrary() {
    setError(null);
    setChoosingSource(false);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(
          "Photo access was denied. Allow it in your device settings to choose photos.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) {
        onChange([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch {
      setError("Could not open the photo library.");
    }
  }

  async function openCamera() {
    setError(null);
    setChoosingSource(false);
    if (!IS_SIMULATOR && !cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        setError(
          "Camera access was denied. Allow it in your device settings to take photos.",
        );
        return;
      }
    }
    setCameraVisible(true);
  }

  async function capturePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.85,
      });
      if (photo?.uri) {
        onChange([...images, photo.uri]);
        setCameraVisible(false);
      }
    } catch {
      setError(
        "Could not take the photo. Try again or choose one from the library.",
      );
      setCameraVisible(false);
    }
  }

  // Editing selected photo
  // Used by both rotate and crop - applies the change, puts the new file in place of the old one, and handles any error in one place.
  async function editSelected(edit: (uri: string) => Promise<string>) {
    if (selectedIndex === null || !selectedUri) return;
    setError(null);
    setProcessing(true);
    try {
      const newUri = await edit(selectedUri);
      const updated = [...images];
      updated[selectedIndex] = newUri;
      onChange(updated);
    } catch {
      setError("Could not edit the photo.");
    } finally {
      setProcessing(false);
    }
  }

  async function rotateImage(uri: string): Promise<string> {
    const image = await ImageManipulator.manipulate(uri)
      .rotate(90)
      .renderAsync();
    const result = await image.saveAsync(SAVE_OPTIONS);
    return result.uri;
  }

  async function cropToSquare(uri: string): Promise<string> {
    const original = await ImageManipulator.manipulate(uri).renderAsync();
    const size = Math.min(original.width, original.height);
    const image = await ImageManipulator.manipulate(uri)
      .crop({
        originX: (original.width - size) / 2,
        originY: (original.height - size) / 2,
        width: size,
        height: size,
      })
      .renderAsync();
    const result = await image.saveAsync(SAVE_OPTIONS);
    return result.uri;
  }

  function removeSelected() {
    if (selectedIndex === null) return;
    onChange(images.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(null);
  }

  // UI
  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {images.map((uri, index) => (
          <Pressable
            key={`${index}-${uri.slice(-24)}`}
            onPress={() =>
              setSelectedIndex(index === selectedIndex ? null : index)
            }
            disabled={disabled}
            className={`aspect-square w-[31%] overflow-hidden rounded-input bg-line ${
              index === selectedIndex ? "border-[3px] border-ink" : ""
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Photo ${index + 1}`}
          >
            <Image
              source={{ uri }}
              className="h-full w-full"
              resizeMode="cover"
            />
            {processing && index === selectedIndex && (
              <View className="absolute inset-0 items-center justify-center bg-ink/40">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        ))}
        <Pressable
          onPress={() => setChoosingSource((open) => !open)}
          disabled={disabled}
          className="aspect-square w-[31%] items-center justify-center gap-1 rounded-input border-2 border-dashed border-line bg-paper active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Add photo"
        >
          {images.length === 0 ? (
            <Camera size={22} color="#17181A" />
          ) : (
            <Plus size={22} color="#17181A" />
          )}
          <Text className="font-body-semibold text-xs text-ink">Add</Text>
        </Pressable>
      </View>

      {choosingSource && (
        <View className="flex-row gap-2">
          <SourceButton
            icon={<Camera size={18} color="#17181A" />}
            label="Take photo"
            onPress={openCamera}
          />
          <SourceButton
            icon={<Images size={18} color="#17181A" />}
            label="Library"
            onPress={pickFromLibrary}
          />
        </View>
      )}

      {selectedUri && (
        <View className="flex-row gap-2">
          {!isUploaded(selectedUri) && (
            <>
              <SourceButton
                icon={<RotateCw size={18} color="#17181A" />}
                label="Rotate"
                onPress={() => editSelected(rotateImage)}
                disabled={processing}
              />
              <SourceButton
                icon={<Crop size={18} color="#17181A" />}
                label="Square"
                onPress={() => editSelected(cropToSquare)}
                disabled={processing}
              />
            </>
          )}
          <SourceButton
            icon={<Trash size={18} color="#7A2508" />}
            label="Remove"
            onPress={removeSelected}
            disabled={processing}
            danger
          />
        </View>
      )}

      {error && (
        <Text className="font-body text-sm text-danger-ink">{error}</Text>
      )}
      {images.length > 0 && !selectedUri && (
        <Text className="font-body text-sm text-muted">
          Tap a photo to rotate, crop or remove it.
        </Text>
      )}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View className="flex-1 bg-black">
          {IS_SIMULATOR ? (
            <View className="flex-1 items-center justify-center p-6">
              <Text className="text-center font-body-semibold text-base text-white">
                The simulator has no camera - use Library instead.
              </Text>
            </View>
          ) : (
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
          )}

          <SafeAreaView
            edges={["bottom"]}
            className="absolute bottom-0 left-0 right-0"
          >
            <View className="flex-row items-center justify-between px-10 py-6">
              <CameraButton
                onPress={() => setCameraVisible(false)}
                label="Close camera"
              >
                <X size={24} color="#FFFFFF" />
              </CameraButton>

              <Pressable
                onPress={capturePhoto}
                disabled={IS_SIMULATOR}
                className={`h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white ${
                  IS_SIMULATOR ? "opacity-40" : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
              >
                <View className="h-[58px] w-[58px] rounded-full bg-white" />
              </Pressable>

              <CameraButton
                onPress={() =>
                  setFacing((current) =>
                    current === "back" ? "front" : "back",
                  )
                }
                label="Switch camera"
                disabled={IS_SIMULATOR}
              >
                <SwitchCamera size={24} color="#FFFFFF" />
              </CameraButton>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

// Small components only used in this file.
function SourceButton({
  icon,
  label,
  onPress,
  disabled = false,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-button border bg-surface active:opacity-70 ${
        danger ? "border-danger-ink/30" : "border-line"
      }`}
    >
      {icon}
      <Text
        className={`font-body-semibold text-sm ${danger ? "text-danger-ink" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CameraButton({
  onPress,
  label,
  disabled = false,
  children,
}: {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-12 w-12 items-center justify-center rounded-full bg-white/20 ${
        disabled ? "opacity-40" : ""
      }`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  );
}
