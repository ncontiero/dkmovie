import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { resentEmailVerification } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";
import { getErrorMessage } from "@/utils/errors";
import { type ButtonProps, Button } from "./ui/button";

export function ResendEmailCodeButton({
  text,
  ...props
}: ButtonProps & { readonly text?: string }) {
  const t = useTranslations("auth.emailVerification.resend");
  const navigate = useNavigate();

  const {
    mutate: resendEmailVerificationMutation,
    isPending: isResendEmailVerificationPending,
  } = useMutation({
    mutationFn: resentEmailVerification,
    onSuccess: () => {
      toast.success(t("success"));
      navigate("/account/verify-email");
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        if (error.status === 403 || error.status === 429) {
          toast.error(t("tooManyRequests"));
        }
        return;
      }

      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      toast.error(error.message);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        resendEmailVerificationMutation();
      }}
      loading={isResendEmailVerificationPending}
      {...props}
    >
      {text || t("send")}
    </Button>
  );
}
