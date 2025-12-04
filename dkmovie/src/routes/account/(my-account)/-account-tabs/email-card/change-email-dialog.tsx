import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
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
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { changeEmail } from "@/http/account/emails";
import {
  type ChangeEmailSchema,
  changeEmailSchema,
} from "@/schemas/account/email";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export function ChangeEmailDialog() {
  const t = useTranslations("accountPage.email.change");
  const commonT = useTranslations("common");
  const [showDialog, setShowDialog] = useState(false);
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.invalidEmail"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeEmailSchema, { error: schemaTranslator }),
  });

  const onSubmit: SubmitHandler<ChangeEmailSchema> = async (data) => {
    try {
      const res = await changeEmail(data);
      queryClient.setQueryData(["user-emails"], res.data);
      toast.success(t("success"), {
        description: t("successDescription"),
      });
      navigate({ to: "/account/verify-email", search: { next: "/account" } });
    } catch (error) {
      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => setShowDialog(true),
          onCancel: () => setShowDialog(false),
        });
        return;
      }

      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error(commonT("errors.unexpected"));
    }
  };

  if (isReAuthenticating) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Edit />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mt-2 flex flex-col gap-2">
            <Label htmlFor="email">{commonT("fields.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={commonT("fields.emailPlaceholder")}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {commonT("actions.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              {commonT("actions.change")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
