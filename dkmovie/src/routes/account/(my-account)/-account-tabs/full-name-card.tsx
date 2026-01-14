import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { updateMe } from "@/http/account/me";
import { type UpdateMeSchema, updateMeSchema } from "@/schemas/account/me";
import { getErrorMessage } from "@/utils/errors";

export function FullNameCard() {
  const { user } = useRouteContext({
    from: "__root__",
    select: (ctx) => ctx.auth,
  });
  const queryClient = useQueryClient();
  const t = useTranslations("accountPage.updateUserName");
  const commonT = useTranslations("common");

  const { schemaTranslator } = useSchemaTranslations<UpdateMeSchema>({
    defaultError: commonT("errors.invalid"),
    messages: {
      name: {
        too_small: t("errors.minCharacter"),
        too_big: t("errors.maxCharacter"),
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateMeSchema, { error: schemaTranslator }),
    values: {
      name: user?.name || "",
    },
  });

  const watchedValues = useWatch({ control });

  const onSubmit: SubmitHandler<UpdateMeSchema> = async (data) => {
    try {
      const res = await updateMe(data);
      queryClient.setQueryData(["session", "me"], res);
      toast.success(t("success"));
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
    <Card asChild>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col p-4 sm:p-6">
          <Label htmlFor="full-name">
            <CardTitle>{t("fullName")}</CardTitle>
          </Label>
          <Input
            id="full-name"
            type="text"
            className="mt-4"
            placeholder={t("fullName")}
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-destructive mt-1 text-sm">
              {errors.name.message}
            </p>
          ) : null}
          <CardDescription>{t("description")}</CardDescription>
        </CardContent>
        <CardFooter>
          <CardFooterDescription>{t("useMaxCharacter")}</CardFooterDescription>
          <Button
            type="submit"
            size="sm"
            disabled={user?.name === watchedValues.name}
            loading={isSubmitting}
          >
            {commonT("actions.save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
