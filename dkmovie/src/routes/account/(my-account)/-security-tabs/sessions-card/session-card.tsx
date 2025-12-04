import type { SessionItem } from "@/http/account/sessions";
import { Laptop, Smartphone, X } from "lucide-react";
import { UAParser } from "ua-parser-js";
import { useTranslations } from "use-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntl } from "@/hooks/use-intl";

interface SessionCardProps {
  readonly session: SessionItem;
  readonly deleteSessionsMutation: (sessionIds: number[]) => void;
}

export function SessionCard({
  session,
  deleteSessionsMutation,
}: SessionCardProps) {
  const { lang } = useIntl();
  const t = useTranslations("securityPage.session");
  const lastSeenDate = new Date(
    (session.last_seen_at || session.created_at) * 1000,
  );
  const lastSeenFormatted = lastSeenDate.toLocaleString(lang, {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const { device, browser, os } = UAParser(session.user_agent);
  const deviceType = device.type;
  const DeviceIcon =
    deviceType === "mobile" || deviceType === "tablet" ? Smartphone : Laptop;

  return (
    <div key={session.id} className="group relative rounded-lg border p-4">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <DeviceIcon />
          <p className="font-semibold">{os.name || t("unknown")}</p>
          {session.is_current ? (
            <Badge variant="defaultOutline">{t("current")}</Badge>
          ) : null}
        </div>
        <div className="text-muted-foreground flex flex-col gap-1 text-sm">
          <p>
            {browser.name} {browser.version}
          </p>
          <p>{session.ip}</p>
          <p>
            {t("lastSeen")}: {lastSeenFormatted}
          </p>
        </div>
      </div>
      {!session.is_current && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => deleteSessionsMutation([session.id])}
        >
          <X />
          <span className="sr-only">
            {t("terminateSession", {
              deviceType: deviceType || t("unknownDevice"),
            })}
          </span>
        </Button>
      )}
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <Skeleton className="w-full rounded-lg p-4">
      <Skeleton className="bg-background h-7 w-1/3" />
      <div className="mt-2 flex flex-col gap-1">
        <Skeleton className="bg-background h-5 w-1/4" />
        <Skeleton className="bg-background h-5 w-1/3" />
        <Skeleton className="bg-background h-5 w-1/4" />
      </div>
    </Skeleton>
  );
}
