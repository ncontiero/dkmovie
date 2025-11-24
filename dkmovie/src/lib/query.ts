import { QueryClient } from "@tanstack/react-query";
import { HTTPError } from "@/http/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => {
        if (error instanceof HTTPError && error.status === 401) {
          return false;
        }
        return count < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
