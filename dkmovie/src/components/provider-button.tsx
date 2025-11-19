import { type ReactNode, useState } from "react";
import { Loader } from "lucide-react";
import { apiAuthBasePath } from "@/http/client";
import { getCookie } from "@/utils/get-cookie";
import { GoogleIcon } from "./icons/google";
import { type ButtonProps, Button } from "./ui/button";

interface ProviderButtonProps {
  readonly provider?: string;
  readonly process?: "login" | "connect";
  readonly text?: string;
  readonly addIcon?: boolean;
  readonly iconToUse?: ReactNode;
  readonly buttonProps?: ButtonProps;
}

const providersIconsMap = {
  google: GoogleIcon,
};
export type ProvidersIconsMap = typeof providersIconsMap;
export type ProviderIconKey = keyof ProvidersIconsMap;

export function ProviderIcon({
  provider,
  className,
}: {
  readonly provider: string;
  readonly className?: string;
}) {
  const Icon = providersIconsMap[provider as ProviderIconKey];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function ProviderButton({
  process = "login",
  text = "Continue with Google",
  provider = "google",
  addIcon = true,
  iconToUse,
  buttonProps,
}: ProviderButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const icon = iconToUse ?? <ProviderIcon provider={provider} />;

  const actionUrl = `${apiAuthBasePath}/auth/provider/redirect`;
  const csrfToken = getCookie("csrftoken");

  return (
    <form
      method="POST"
      action={actionUrl}
      onSubmit={() => setIsSubmitting(true)}
    >
      <input type="hidden" name="provider" value={provider} />
      <input
        type="hidden"
        name="callback_url"
        value="/account/provider/callback"
      />
      <input type="hidden" name="process" value={process} />
      <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
      <Button
        variant="outline"
        size="sm"
        {...buttonProps}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader className="animate-spin" />
        ) : addIcon ? (
          icon
        ) : null}
        {text}
      </Button>
    </form>
  );
}
