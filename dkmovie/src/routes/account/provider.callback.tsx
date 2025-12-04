import { useEffect, useEffectEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { object, string } from "zod";
import { useMFA } from "@/hooks/use-mfa";

export const Route = createFileRoute("/account/provider/callback")({
  component: ProviderCallbackComponent,
  validateSearch: (search) =>
    object({ error: string().optional() }).parse(search),
});

function ProviderCallbackComponent() {
  const t = useTranslations("providerCallbackError");
  const { initializeMFAIfNecessary } = useMFA();

  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const error = searchParams.error;

  const onMount = useEffectEvent(() => {
    initializeMFAIfNecessary();

    if (!error) {
      navigate({ to: "/account/security" });
      return;
    }
  });

  useEffect(() => {
    onMount();
  }, []);

  if (!error) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
      <p className="text-center">{t("description")}</p>
    </div>
  );
}
