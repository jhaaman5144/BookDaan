import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/user", {
        withCredentials: true, // very important!
      });
      return res.data;
    },
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
