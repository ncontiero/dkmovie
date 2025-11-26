import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { AuthFormWithCodeProps, AuthWithCodeProps } from "./types";
import type { PropsWithChildren } from "react";
import { Loader } from "lucide-react";
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
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            "Re-authenticate"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
