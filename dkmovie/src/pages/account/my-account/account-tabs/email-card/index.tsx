import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "use-intl";
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
import { getUserEmails } from "@/http/account/emails";
import { ChangeEmailDialog } from "./change-email-dialog";

export function UserEmailCard() {
  const t = useTranslations("accountPage.email");

  const { data: userEmails, isLoading: isUserEmailsLoading } = useQuery({
    queryKey: ["user-emails"],
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

  return (
    <Card className="mt-10">
      <CardContent className="flex flex-col p-4 sm:p-6">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
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
                    <Badge variant="defaultOutline">{t("verified")}</Badge>
                  ) : (
                    <Badge variant="destructiveOutline">
                      {t("unverified")}
                    </Badge>
                  )}
                  {primary ? (
                    <Badge variant="success">{t("primary")}</Badge>
                  ) : null}
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
        <CardFooterDescription>{t("cardDescription")}</CardFooterDescription>
        <ChangeEmailDialog />
      </CardFooter>
    </Card>
  );
}
