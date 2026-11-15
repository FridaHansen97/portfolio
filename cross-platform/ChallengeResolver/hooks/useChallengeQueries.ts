// React Query hooks for challenges and the signed-in user's progress.
import { getAllChallenges, getChallengeById } from "@/api/challengeApi";
import { getMyProgress, getMyProgressMap } from "@/api/progressApi";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

export const queryKeys = {
  challenges: ["challenges"] as const,
  challenge: (id: string) => ["challenges", id] as const,
  // Progress keys include the uid: if another user signs in on the same device,
  // they get their own cache entry instead of seeing the previous user's progress.
  progressMap: (uid: string) => ["progress", uid] as const,
  progress: (uid: string, challengeId: string) =>
    ["progress", uid, challengeId] as const,
};

export function useChallengesQuery() {
  return useQuery({
    queryKey: queryKeys.challenges,
    queryFn: getAllChallenges,
  });
}

export function useChallengeQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challenge(id ?? ""),
    queryFn: () => getChallengeById(id!),
    enabled: !!id,
  });
}

export function useMyProgressMapQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.progressMap(user?.uid ?? ""),
    queryFn: getMyProgressMap,
    enabled: !!user,
  });
}

export function useMyProgressQuery(challengeId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.progress(user?.uid ?? "", challengeId ?? ""),
    queryFn: () => getMyProgress(challengeId!),
    enabled: !!user && !!challengeId,
  });
}
