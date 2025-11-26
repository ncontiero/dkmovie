import { useQuery } from "@tanstack/react-query";
import { getCurrentSession } from "@/http/auth/session";

export function useFetchSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => await getCurrentSession(),
    staleTime: 1000 * 60 * 5,
  });
}
