import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { RecoveryCodesDialog } from "@/components/recovery-codes/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import {
  addWebAuthCredentials,
  getWebAuthCredentials,
} from "@/http/account/passkey";
import {
  type AddPasskeySchema,
  addPasskeySchema,
} from "@/schemas/account/passkey";
import { needReAuthentication } from "@/utils/auth-flows";

export function AddPasskey() {
  const t = useTranslations("securityPage.2fa.passkey");
  const queryClient = useQueryClient();
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();
  const [showDialog, setShowDialog] = useState(false);
  const [recoveryCodesGenerated, setRecoveryCodesGenerated] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addPasskeySchema),
  });

  const onSubmit: SubmitHandler<AddPasskeySchema> = async (data) => {
    try {
      const credentials = await getWebAuthCredentials();
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
        credentials.data.creation_options.publicKey,
      );
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential;
      const res = await addWebAuthCredentials(credential.toJSON(), data);

      toast.success(t("addSuccessfully"));
      if (res?.meta?.recovery_codes_generated) {
        setRecoveryCodesGenerated(true);
      }
      queryClient.invalidateQueries({ queryKey: ["2fa"] });
      setShowDialog(false);
      reset();
    } catch (error) {
      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => {
            setShowDialog(true);
            handleSubmit(onSubmit)();
          },
          onCancel: () => {
            setShowDialog(false);
          },
        });
        return;
      }

      console.error(error);
      toast.error(t("addFailed"));
    }
  };

  if (isReAuthenticating) return null;

  return recoveryCodesGenerated ? (
    <RecoveryCodesDialog />
  ) : (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addPasskey")}</DialogTitle>
          <DialogDescription>{t("addPasskeyDescription")}</DialogDescription>
        </DialogHeader>
        <form
          className="mt-3 flex w-full flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("myPasskey")}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin" /> : t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
