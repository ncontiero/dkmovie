import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { type ReAuthSchema, reAuth, reAuthSchema } from "@/http/auth/re-auth";
import { HTTPError } from "@/http/client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { PasswordInput } from "./ui/password-input";

export interface ReauthenticateDialogProps {
  readonly onReAuthenticated: () => void;
  readonly cancel?: () => void;
}

export function ReAuthenticateDialog({
  onReAuthenticated,
  cancel,
}: ReauthenticateDialogProps) {
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reAuthSchema),
  });

  const onSubmit: SubmitHandler<ReAuthSchema> = async (data) => {
    try {
      const res = await reAuth(data);
      queryClient.setQueryData(["session"], res);
      toast.success("Re-authenticated successfully");
      onReAuthenticated();
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
        return;
      }

      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog defaultOpen open>
      <DialogContent addClose={false}>
        <DialogHeader>
          <DialogTitle>Re-authenticate to continue</DialogTitle>
          <DialogDescription>
            You need to re-authenticate to perform this action.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password ? (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          {apiErrors.length > 0 && (
            <ul className="text-destructive mt-2 list-inside list-disc text-sm">
              {apiErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={cancel}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
