import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
