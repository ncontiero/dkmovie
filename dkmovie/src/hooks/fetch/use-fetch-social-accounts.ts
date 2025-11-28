import { useQuery } from "@tanstack/react-query";
import { getSocialAccounts } from "@/http/get-config";

export function useFetchSocialAccounts() {
  return useQuery({
    queryKey: ["social-accounts"],
    queryFn: getSocialAccounts,
    staleTime: Infinity,
  });
}
