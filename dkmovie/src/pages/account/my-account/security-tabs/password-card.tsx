import { useEffect, useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardFooterDescription,
  CardTitle,
} from "@/components/card";
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
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/hooks/use-session";
import { changePassword } from "@/http/account/password";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
} from "@/schemas/account/password";
import { getErrorMessage } from "@/utils/errors";

export function PasswordCard() {
  const t = useTranslations("securityPage.changePassword");
  const errorsT = useTranslations("errors");
  const queryClient = useQueryClient();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { session } = useSession();

  const user = session?.user;
  const hasUsablePassword = user?.has_usable_password ?? false;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const { new_password: watchNewPassword } = useWatch({ control });

  useEffect(() => {
    if (hasUsablePassword || !watchNewPassword) return;
    setValue("current_password", watchNewPassword);
  }, [hasUsablePassword, setValue, watchNewPassword]);

  if (!session || !user) return null;

  const onSubmit: SubmitHandler<ChangePasswordSchema> = async (data) => {
    try {
      await changePassword(data, hasUsablePassword);
      if (!hasUsablePassword) {
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
      toast.success(
        hasUsablePassword ? t("success.updated") : t("success.set"),
      );
      setShowPasswordDialog(false);
      reset();
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error(errorsT("unexpected"));
    }
  };

  return (
    <Card>
      <CardContent>
        <CardTitle>{t("card.title")}</CardTitle>
        <CardDescription>
          {hasUsablePassword
            ? t("card.description")
            : t("card.nonPasswordDescription")}
        </CardDescription>
        {hasUsablePassword ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg border p-4">
            <LockKeyhole className="text-primary" />
            <span className="-mb-2">***********</span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className={!hasUsablePassword ? "sm:justify-end" : ""}>
        {hasUsablePassword ? (
          <CardFooterDescription>
            <Link
              to={`/auth/password/forgot?email=${user.email}`}
              size="sm"
              variant="muted"
            >
              {t("card.forgotPassword")}
            </Link>
          </CardFooterDescription>
        ) : null}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogTrigger asChild>
            <Button type="button" size="sm">
              {hasUsablePassword ? t("card.change") : t("card.set")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {hasUsablePassword ? t("card.change") : t("card.set")}
              </DialogTitle>
              <DialogDescription>
                {hasUsablePassword
                  ? t("card.changeDialogDescription")
                  : t("card.setDialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-4 flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {hasUsablePassword ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current-password">
                    {t("form.currentPassword")}
                  </Label>
                  <PasswordInput
                    id="current-password"
                    {...register("current_password")}
                  />
                  {errors.current_password ? (
                    <span className="text-destructive text-sm">
                      {errors.current_password.message}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">{t("form.newPassword")}</Label>
                <PasswordInput
                  id="new-password"
                  {...register("new_password")}
                />
                {errors.new_password ? (
                  <span className="text-destructive text-sm">
                    {errors.new_password.message}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-new-password">
                  {t("form.confirmPassword")}
                </Label>
                <PasswordInput
                  id="confirm-new-password"
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation ? (
                  <span className="text-destructive text-sm">
                    {errors.password_confirmation.message}
                  </span>
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("form.cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader className="animate-spin" />
                  ) : hasUsablePassword ? (
                    t("card.change")
                  ) : (
                    t("card.set")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
