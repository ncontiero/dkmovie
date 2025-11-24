import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardFooterDescription,
  CardTitle,
} from "@/components/card";
import { deleteSessions, getSessions } from "@/http/account/sessions";
import { SessionCard, SessionCardSkeleton } from "./session-card";

export function SessionsCard() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => getSessions(),
    select: (data) =>
      data.data.sort((a, b) => {
        if (a.is_current) return -1;
        if (b.is_current) return 1;
        return (
          (b.last_seen_at || b.created_at) - (a.last_seen_at || a.created_at)
        );
      }),
  });

  const { mutate: deleteSessionsMutation } = useMutation({
    mutationFn: async (sessionIds: number[]) => {
      return await deleteSessions(sessionIds);
    },
    onMutate: () => {
      toast.loading("Terminating selected sessions...", {
        id: "terminate-sessions",
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["sessions"], data);
      toast.success("Selected sessions have been terminated.", {
        id: "terminate-sessions",
      });
    },
    onError: () => {
      toast.error("Failed to terminate selected sessions.", {
        id: "terminate-sessions",
      });
    },
  });

  return (
    <Card className="mt-10">
      <CardContent>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage your active sessions.</CardDescription>
        <div className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            <SessionCardSkeleton />
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                deleteSessionsMutation={deleteSessionsMutation}
              />
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <CardFooterDescription>
          Review and manage your active sessions to ensure your account&apos;s
          security.
        </CardFooterDescription>
      </CardFooter>
    </Card>
  );
}
