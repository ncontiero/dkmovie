import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { AuthFormWithCodeProps, AuthWithCodeProps } from "./types";
import type { PropsWithChildren } from "react";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";

interface ReAuthWithCodeProps
  extends AuthWithCodeProps,
    Partial<ReAuthenticationProps>,
    PropsWithChildren,
    AuthFormWithCodeProps {}

export function ReAuthWithCode({
  type,
  onCancel,
  description,
  children,
  isSubmitting = false,
}: ReAuthWithCodeProps) {
  const t = useTranslations("auth");
  if (!onCancel) {
    throw new Error("onCancel is required for ReAuthWithCode component");
  }

  return (
    <div className="flex flex-col gap-4">
      <Label htmlFor={`${type}-code`} className="my-2 justify-between">
        {description}
      </Label>
      {children}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {t("reAuth.submit")}
        </Button>
      </DialogFooter>
    </div>
  );
}
