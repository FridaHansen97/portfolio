// What the profile tab shows: who is signed in, their numbers, the challenges
// they have created, and sign out. Only draws from props — the screen loads
// the data — so the layout can be previewed and reused without Firebase.
import { ChallengeData } from "@/utils/challengeData";
import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileViewProps = {
  displayName: string | null;
  email: string | null;
  completedCount: number;
  inProgressCount: number;
  createdChallenges: ChallengeData[];
  onOpenChallenge: (id: string) => void;
  onSignOut: () => void;
};

// "Frida Hansen" → "FH", "frida" → "F". Falls back to the email's first letter.
export function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return initials.toUpperCase();
}

// "easy" → "Easy"
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ProfileView({
  displayName,
  email,
  completedCount,
  inProgressCount,
  createdChallenges,
  onOpenChallenge,
  onSignOut,
}: ProfileViewProps) {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-6">
        {/* Avatar + name */}
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-ink">
            <Text className="font-display text-xl text-surface">
              {getInitials(displayName, email)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-2xl text-ink" numberOfLines={1}>
              {displayName || "No name"}
            </Text>
            <Text className="font-body text-sm text-muted" numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        {/* Three numbers side by side */}
        <View className="flex-row gap-3">
          <StatCard
            value={completedCount}
            label="Completed"
            valueClass="text-status-done-ink"
          />
          <StatCard
            value={inProgressCount}
            label="In progress"
            valueClass="text-status-active-ink"
          />
          <StatCard
            value={createdChallenges.length}
            label="Created"
            valueClass="text-ink"
          />
        </View>

        {/* Challenges this user has created */}
        <View className="gap-3">
          <Text className="font-display text-xl text-ink">Made by you</Text>
          {createdChallenges.length === 0 ? (
            <Text className="font-body text-muted">
              You haven't created any challenges yet.
            </Text>
          ) : (
            <View className="overflow-hidden rounded-card bg-surface">
              {createdChallenges.map((challenge, index) => {
                const meta = [
                  challenge.difficulty && capitalize(challenge.difficulty),
                  challenge.category,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <Pressable
                    key={challenge.id}
                    onPress={() => onOpenChallenge(challenge.id)}
                    // Divider between rows, but not above the first one
                    className={`flex-row items-center gap-3 px-4 py-3 active:bg-paper ${
                      index > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <View className="flex-1">
                      <Text
                        className="font-body-semibold text-base text-ink"
                        numberOfLines={1}
                      >
                        {challenge.title}
                      </Text>
                      {meta !== "" && (
                        <Text className="font-body text-sm text-muted">
                          {meta}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={20} color="#55585E" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable
          onPress={onSignOut}
          className="h-[54px] items-center justify-center rounded-button border border-line active:bg-surface"
        >
          <Text className="font-body-semibold text-base text-danger-ink">
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  valueClass,
}: {
  value: number;
  label: string;
  valueClass: string;
}) {
  return (
    <View className="flex-1 gap-0.5 rounded-card bg-surface px-4 py-3">
      <Text className={`font-display text-[28px] ${valueClass}`}>{value}</Text>
      <Text className="font-body text-sm text-muted">{label}</Text>
    </View>
  );
}
