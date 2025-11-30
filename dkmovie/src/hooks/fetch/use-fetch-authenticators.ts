import { useQuery } from "@tanstack/react-query";
import { get2FAAuthenticators } from "@/http/account/2fa";

export function useFetchAuthenticators() {
  return useQuery({
    queryKey: ["2fa"],
    queryFn: get2FAAuthenticators,
    select: ({ data }) => data,
    staleTime: 1000 * 60 * 60,
  });
}
