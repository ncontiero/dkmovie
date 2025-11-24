import { useEffect, useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
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
import { HTTPError } from "@/http/client";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
} from "@/schemas/account/password";

export function PasswordCard() {
  const queryClient = useQueryClient();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { session } = useSession();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
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
      toast.success(`Password ${hasUsablePassword ? "updated" : "set"}!`, {
        description: `Your password has been ${
          hasUsablePassword ? "updated" : "set"
        }.`,
      });
      setApiErrors([]);
      setShowPasswordDialog(false);
      reset();
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
        return;
      }

      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <Card>
      <CardContent>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          {hasUsablePassword
            ? "Change your account password regularly to keep your account secure."
            : "You don't have a password set."}
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
              Forgot password? Click here to reset it.
            </Link>
          </CardFooterDescription>
        ) : null}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogTrigger asChild>
            <Button type="button" size="sm">
              {hasUsablePassword ? "Change password" : "Set password"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {hasUsablePassword ? "Change Password" : "Set Password"}
              </DialogTitle>
              <DialogDescription>
                {hasUsablePassword
                  ? "Change your account password regularly to keep your account secure."
                  : "Set a new password for your account."}
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-4 flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {hasUsablePassword ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <PasswordInput
                    id="current-password"
                    placeholder="Type your current password..."
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
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="Type your new password..."
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
                  Confirm your new password
                </Label>
                <PasswordInput
                  id="confirm-new-password"
                  placeholder="Type your new password again..."
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation ? (
                  <span className="text-destructive text-sm">
                    {errors.password_confirmation.message}
                  </span>
                ) : null}
              </div>
              {apiErrors ? (
                <span className="text-destructive mt-2 text-sm">
                  {apiErrors}
                </span>
              ) : null}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader className="animate-spin" />
                  ) : hasUsablePassword ? (
                    "Change password"
                  ) : (
                    "Set password"
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
