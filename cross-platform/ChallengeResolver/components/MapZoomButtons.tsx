// + and - buttons in the corner of the map. Pinch-zoom is hard on a simulator and a laptop trackpad, so every map gets these. Used both on the iOS and the web maps.
import RoundIconButton from "@/components/RoundIconButton";
import { Minus, Plus } from "lucide-react-native";
import { View } from "react-native";

type MapZoomButtonsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function MapZoomButtons({
  onZoomIn,
  onZoomOut,
}: MapZoomButtonsProps) {
  return (
    <View className="absolute bottom-3 right-3 gap-2">
      <RoundIconButton
        label="Zoom in"
        onPress={onZoomIn}
        className="border border-ink"
      >
        <Plus size={20} color="#17181A" />
      </RoundIconButton>

      <RoundIconButton
        label="Zoom out"
        onPress={onZoomOut}
        className="border border-ink"
      >
        <Minus size={20} color="#17181A" />
      </RoundIconButton>
    </View>
  );
}
