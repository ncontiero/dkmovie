import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { deleteTOTP } from "@/http/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";

export function RemoveTOTP() {
  const t = useTranslations("securityPage.2fa.appAuthenticator");
  const errorsT = useTranslations("errors");
  const queryClient = useQueryClient();
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();

  const { mutate: deleteTOTPMutation, isPending: isDeletingTOTP } = useMutation(
    {
      mutationFn: async () => await deleteTOTP(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["setup-totp"] });
        queryClient.invalidateQueries({ queryKey: ["recovery-codes"] });
        queryClient.invalidateQueries({ queryKey: ["2fa"] });
        toast.success(t("totpRemoved"));
      },
      onError: (error) => {
        if (needReAuthentication(error)) {
          initializeReAuthentication({
            onReAuthenticated: deleteTOTPMutation,
          });
          return;
        }

        console.error(error);
        toast.error(errorsT("unexpected"));
      },
    },
  );

  if (isReAuthenticating) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {t("remove")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeTOTP")}</AlertDialogTitle>
          <AlertDialogDescription>{t("areYouSure")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingTOTP}
              onClick={() => deleteTOTPMutation()}
            >
              {isDeletingTOTP ? (
                <Loader className="animate-spin" />
              ) : (
                t("remove")
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
