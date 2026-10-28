// React Query hooks for challenges and the signed-in user's progress.
// useQuery gives us loading, error, caching and refetch for free, so screens
// don't need their own useState + useEffect for every fetch.
import { getAllChallenges, getChallengeById } from "@/api/challengeApi";
import { getMyProgress, getMyProgressMap } from "@/api/progressApi";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Query keys in one place, so invalidation after a write uses exactly the same keys
export const queryKeys = {
  challenges: ["challenges"] as const,
  challenge: (id: string) => ["challenges", id] as const,
  // Progress keys include the uid: if another user signs in on the same device,
  // they get their own cache entry instead of seeing the previous user's progress.
  progressMap: (uid: string) => ["progress", uid] as const,
  progress: (uid: string, challengeId: string) =>
    ["progress", uid, challengeId] as const,
};

// All challenges (shared between users)
export function useChallengesQuery() {
  return useQuery({
    queryKey: queryKeys.challenges,
    queryFn: getAllChallenges,
  });
}

// One challenge by id — disabled until an id is available
export function useChallengeQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challenge(id ?? ""),
    queryFn: () => getChallengeById(id!),
    enabled: !!id,
  });
}

// The signed-in user's progress for every challenge, keyed by challengeId
export function useMyProgressMapQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.progressMap(user?.uid ?? ""),
    queryFn: getMyProgressMap,
    enabled: !!user,
  });
}

// The signed-in user's progress for a single challenge
export function useMyProgressQuery(challengeId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.progress(user?.uid ?? "", challengeId ?? ""),
    queryFn: () => getMyProgress(challengeId!),
    enabled: !!user && !!challengeId,
  });
}
