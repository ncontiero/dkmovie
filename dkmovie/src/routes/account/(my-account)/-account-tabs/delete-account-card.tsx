import type { ReactNode } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { Card, CardContent, CardFooter } from "@/components/card";
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
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { useSession } from "@/hooks/use-session";
import { deleteMyAccount } from "@/http/account/me";
import {
  type ConfirmDeleteAccountSchema,
  confirmDeleteAccountSchema,
} from "@/schemas/account/delete-account";

function irreversibleWarning(chunks: ReactNode) {
  return <span className="text-destructive font-bold">{chunks}</span>;
}

function labelBold(chunks: ReactNode) {
  return <b>{chunks}</b>;
}

export function DeleteAccountCard() {
  const t = useTranslations("accountPage.deleteAccount");
  const commonT = useTranslations("common");
  const { session, setSession } = useSession();
  const router = useRouter();
  const navigate = useNavigate();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.invalidEmail"),
  });

  const userEmail = session?.user.email;
  const confirmText = t("confirmText");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(confirmDeleteAccountSchema, {
      error: schemaTranslator,
    }),
  });

  const onSubmit: SubmitHandler<ConfirmDeleteAccountSchema> = async (data) => {
    if (data.confirmEmail !== userEmail) {
      setError("confirmEmail", {
        type: "manual",
        message: t("incorrectEmail"),
      });
      return;
    }
    if (data.confirmText !== confirmText) {
      setError("confirmText", {
        type: "manual",
        message: t("incorrectText"),
      });
      return;
    }

    try {
      await deleteMyAccount();
      setSession(null);
      await router.invalidate();
      toast.success(t("success"));
      navigate({ to: "/" });
    } catch {
      toast.error(t("failed"));
    }
  };

  if (!userEmail) return null;

  return (
    <Card className="border-destructive mt-10">
      <CardContent className="flex flex-col p-4 sm:p-6">
        <h3 className="text-lg font-bold">{t("title")}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{t("description")}</p>
      </CardContent>
      <CardFooter className="bg-destructive/20 border-destructive dark:bg-destructive/20 sm:justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="destructive">
              {t("title")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                {t.rich("dialogDescription", {
                  span: irreversibleWarning,
                })}
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-2 flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="confirm-email"
                  className="gap-1 font-normal select-auto"
                >
                  {t.rich("enterYourEmail", {
                    email: session?.user.email,
                    b: labelBold,
                  })}
                </Label>
                <Input
                  id="confirm-email"
                  type="text"
                  {...register("confirmEmail")}
                />
                {errors.confirmEmail ? (
                  <p className="text-destructive text-sm">
                    {errors.confirmEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="confirm-text"
                  className="gap-1 font-normal select-auto"
                >
                  {t.rich("enterDeleteMyAccount", {
                    b: labelBold,
                  })}
                </Label>
                <Input
                  id="confirm-text"
                  type="text"
                  {...register("confirmText")}
                />
                {errors.confirmText ? (
                  <p className="text-destructive text-sm">
                    {errors.confirmText.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{commonT("actions.cancel")}</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  type="submit"
                  loading={isSubmitting}
                >
                  {t("confirmDelete")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
