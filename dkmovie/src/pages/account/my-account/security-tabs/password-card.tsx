import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  type ChangePasswordSchema,
  changePassword,
  changePasswordSchema,
} from "@/http/account/password";
import { HTTPError } from "@/http/client";

export function PasswordCard() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { session } = useSession();
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  if (!session || !session.user) return null;

  const onSubmit: SubmitHandler<ChangePasswordSchema> = async (data) => {
    try {
      await changePassword(data);
      toast.success("Password changed successfully!", {
        description: "Please use your new password the next time you log in.",
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
          Change your account password regularly to keep your account secure.
        </CardDescription>
        <div className="mt-4 flex items-center gap-3 rounded-lg border p-4">
          <LockKeyhole className="text-primary" />
          <span className="-mb-2">***********</span>
        </div>
      </CardContent>
      <CardFooter>
        <CardFooterDescription>
          <Link
            to={`/auth/password/forgot?email=${session.user.email}`}
            size="sm"
            variant="muted"
          >
            Forgot password? Click here to reset it.
          </Link>
        </CardFooterDescription>
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogTrigger asChild>
            <Button type="button" size="sm">
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Change your account password regularly to keep your account
                secure.
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-4 flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
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
                  ) : (
                    "Update password"
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
