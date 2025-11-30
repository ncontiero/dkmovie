import { useQuery } from "@tanstack/react-query";
import { getCurrentSession } from "@/http/auth/session";

export function useFetchSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getCurrentSession,
    staleTime: 1000 * 60 * 5,
  });
}
