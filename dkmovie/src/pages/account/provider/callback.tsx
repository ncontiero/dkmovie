import { useEffect, useEffectEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { useMFA } from "@/hooks/use-mfa";

export default function ProviderCallbackPage() {
  const t = useTranslations("providerCallbackError");
  const { initializeMFAIfNecessary } = useMFA();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get("error");
  const onMount = useEffectEvent(() => {
    initializeMFAIfNecessary();

    if (!error) {
      navigate("/account/security");
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
