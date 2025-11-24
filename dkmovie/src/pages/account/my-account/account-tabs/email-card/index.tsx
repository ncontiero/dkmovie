import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardFooterDescription,
  CardTitle,
} from "@/components/card";
import { ResendEmailCodeButton } from "@/components/resend-email-code-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { getUserEmails } from "@/http/account/emails";
import { ChangeEmailDialog } from "./change-email-dialog";

export function UserEmailCard() {
  const { session } = useSession();
  const userId = session?.user.id;

  const { data: userEmails, isLoading: isUserEmailsLoading } = useQuery({
    queryKey: ["user-emails", userId],
    queryFn: async () => {
      return await getUserEmails();
    },
    staleTime: 1000 * 60 * 60,
    select: (data) => {
      return data.sort((a, b) => {
        if (a.primary) return -1;
        if (b.primary) return 1;
        return 0;
      });
    },
  });

  if (!userId) return null;

  return (
    <Card className="mt-10">
      <CardContent className="flex flex-col p-4 sm:p-6">
        <CardTitle>Email</CardTitle>
        <CardDescription>
          Manage the email address you want to use to log in to your account.
        </CardDescription>
        <div className="mt-4 flex flex-col gap-2">
          {isUserEmailsLoading ? (
            <Skeleton className="flex h-14 items-center gap-2 px-4">
              <Skeleton className="bg-background h-1/2 w-1/4" />
              <Skeleton className="bg-background h-1/2 w-1/12" />
              <Skeleton className="bg-background h-1/2 w-1/12" />
            </Skeleton>
          ) : (
            userEmails?.map(({ email, primary, verified }) => (
              <div
                key={email}
                className={`flex items-center justify-between rounded-lg border ${verified ? "p-4" : "px-4 py-2"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{email}</span>
                  {verified ? (
                    <Badge variant="defaultOutline">Verified</Badge>
                  ) : (
                    <Badge variant="destructiveOutline">Unverified</Badge>
                  )}
                  {primary ? <Badge variant="success">Primary</Badge> : null}
                </div>
                <div className="flex items-center gap-2">
                  {!verified ? <ResendEmailCodeButton /> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <CardFooterDescription>
          Email must be verified to be able to login with them or be used as
          primary email.
        </CardFooterDescription>
        <ChangeEmailDialog userId={userId} />
      </CardFooter>
    </Card>
  );
}
