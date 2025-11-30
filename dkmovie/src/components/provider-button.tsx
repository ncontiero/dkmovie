import type { InitializeReAuthentication } from "@/context/reauthenticate/context";
import { type ReactNode, useRef, useState } from "react";
import { apiAuthBasePath } from "@/http/client";
import { getCookie } from "@/utils/get-cookie";
import { GoogleIcon } from "./icons/google";
import { type ButtonProps, Button } from "./ui/button";

interface ProviderButtonProps extends ButtonProps {
  readonly provider?: string;
  readonly process?: "login" | "connect";
  readonly text: string;
  readonly addIcon?: boolean;
  readonly iconToUse?: ReactNode;
  readonly initializeReAuthentication?: InitializeReAuthentication;
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
  text,
  provider = "google",
  addIcon = true,
  iconToUse,
  initializeReAuthentication,
  ...buttonProps
}: ProviderButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const icon = iconToUse ?? <ProviderIcon provider={provider} />;

  const actionUrl = `${apiAuthBasePath}/auth/provider/redirect`;
  const csrfToken = getCookie("csrftoken");

  return (
    <form
      ref={formRef}
      method="POST"
      action={actionUrl}
      onSubmit={(e) => {
        setIsSubmitting(true);
        if (!initializeReAuthentication) return;

        e.preventDefault();
        initializeReAuthentication({
          onReAuthenticated: () => {
            formRef.current?.submit();
          },
        });
      }}
      className={buttonProps.className}
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
        loading={isSubmitting}
        loadingText={text}
      >
        {addIcon ? icon : null}
        {text}
      </Button>
    </form>
  );
}
