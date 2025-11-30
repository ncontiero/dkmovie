import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useSession } from "@/hooks/use-session";
import { reAuth } from "@/http/auth/re-auth";
import { type ReAuthSchema, reAuthSchema } from "@/schemas/auth/re-auth";
import { getErrorMessage, translateZodError } from "@/utils/errors";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/password-input";

export function ReAuthenticateWithPassword({
  onReAuthenticated,
  onCancel,
}: ReAuthenticationProps) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const { setSession } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reAuthSchema, {
      error: (iss) =>
        translateZodError({
          iss,
          messages: { password: commonT("errors.passwordIsRequired") },
          defaultError: commonT("errors.invalid"),
        }),
    }),
  });

  const onSubmit: SubmitHandler<ReAuthSchema> = async (data) => {
    try {
      const res = await reAuth(data);
      setSession(res);
      toast.success(t("reAuth.reAuthenticated"));
      onReAuthenticated();
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error(commonT("errors.unexpected"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{commonT("fields.password")}</Label>
        <PasswordInput id="password" {...register("password")} />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {commonT("actions.cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {t("reAuth.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}
