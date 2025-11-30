import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { RecoveryCodesContent } from "@/components/recovery-codes/content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { regenerateRecoveryCodes } from "@/http/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export function ViewRecoveryCodes() {
  const t = useTranslations("securityPage.2fa.recoveryCodes");
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();

  const {
    mutate: regenerateRecoveryCodesMutation,
    isPending: isRegeneratingRecoveryCodes,
  } = useMutation({
    mutationFn: async () => await regenerateRecoveryCodes(),
    onSuccess: (data) => {
      toast.success(t("regeneratedSuccessfully"));
      queryClient.setQueryData(["recovery-codes"], data);
    },
    onError: (error) => {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => {
            setShowDialog(true);
            regenerateRecoveryCodesMutation();
          },
          onCancel: () => setShowDialog(false),
        });
        return;
      }

      console.error(error);
      toast.error(t("regenerateFailed"));
    },
  });

  if (isReAuthenticating) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("view")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <RecoveryCodesContent
          onReAuthenticationCancel={() => setShowDialog(false)}
        />
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            loading={isRegeneratingRecoveryCodes}
            onClick={() => regenerateRecoveryCodesMutation()}
          >
            {t("regenerate")}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
