import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { resentEmailVerification } from "@/http/auth/verify-email";
import {
  getErrorMessage,
  isHttpForbidden,
  isHttpTooManyRequests,
} from "@/utils/errors";
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
      navigate({ to: "/account/verify-email" });
    },
    onError: (error) => {
      if (isHttpForbidden(error) || isHttpTooManyRequests(error)) {
        toast.error(t("tooManyRequests"));
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
