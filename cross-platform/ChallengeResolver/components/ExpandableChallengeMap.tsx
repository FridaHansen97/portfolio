// A ChallengeMapView with an expand button. Tapping it opens the same map large, in a Modal on top of the app. The app stays visible, dimmed, around the large map.
// Close with the X, Escape on web or by tapping/clicking in the dimmed area. Used on the details screen and in the location step of the resolve screen.
import ChallengeMapView from "@/components/ChallengeMapView";
import RoundIconButton from "@/components/RoundIconButton";
import { ChallengeMapViewProps } from "@/utils/mapUtils";
import { Maximize2, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

// Same props as ChallengeMapView, so it can replace it anywhere.
export default function ExpandableChallengeMap({
  className,
  ...mapProps
}: ChallengeMapViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const close = () => setIsExpanded(false);

  return (
    <>
      <View>
        <ChallengeMapView {...mapProps} className={className} />
        <View className="absolute right-3 top-3">
          <RoundIconButton
            label="Expand map"
            onPress={() => setIsExpanded(true)}
            className="border border-ink"
          >
            <Maximize2 size={18} color="#17181A" />
          </RoundIconButton>
        </View>
      </View>

      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View className="flex-1 px-4 py-16">
          <Pressable
            className="absolute inset-0 bg-ink/60"
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close map"
          />
          <View className="flex-1">
            <ChallengeMapView {...mapProps} className="flex-1 rounded-card" />
            <View className="absolute right-3 top-3">
              <RoundIconButton
                label="Close map"
                onPress={close}
                className="border border-ink"
              >
                <X size={18} color="#17181A" />
              </RoundIconButton>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
