import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Loader } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardFooter,
  CardFooterDescription,
} from "@/components/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import {
  deleteEmail,
  getUserEmails,
  resentEmailVerification,
  setPrimaryEmail,
} from "@/http/account/emails";
import { HTTPError } from "@/http/client";
import { AddEmailDialog } from "./add-email-dialog";

export function UserEmailCard() {
  const { setSession, session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [showDeleteEmailDialog, setShowDeleteEmailDialog] = useState(false);

  const { data: userEmails, isLoading: isUserEmailsLoading } = useQuery({
    queryKey: ["user-emails", userId],
    queryFn: async () => {
      return await getUserEmails();
    },
    staleTime: 60 * 60 * 1000,
    select: (data) => {
      return data.sort((a, b) => {
        if (a.primary) return -1;
        if (b.primary) return 1;
        return 0;
      });
    },
  });

  const { mutate: deleteEmailMutation, isPending: isDeleteEmailPending } =
    useMutation({
      mutationFn: async (email: string) => {
        return await deleteEmail({ email });
      },
      onSuccess: ({ data }) => {
        queryClient.setQueryData(["user-emails", userId], data);
        setShowDeleteEmailDialog(false);
        toast.success("Email deleted successfully");
      },
      onError: (error) => {
        if (error instanceof HTTPError) {
          toast.error(error.data?.errors.map((e: any) => e.message).join("\n"));
          return;
        }
        toast.error(error.message);
        setShowDeleteEmailDialog(false);
      },
    });

  const {
    mutate: setPrimaryEmailMutation,
    isPending: isSetPrimaryEmailPending,
  } = useMutation({
    mutationFn: async (email: string) => {
      return await setPrimaryEmail(email);
    },
    onMutate: () => {
      toast.loading("Setting email as primary...", { id: "set-primary-email" });
    },
    onSuccess: ({ data }) => {
      if (session && session.user) {
        setSession({
          meta: { is_authenticated: true },
          data: {
            user: {
              ...session.user,
              email: data.find((e) => e.primary)?.email || session.user.email,
            },
          },
        });
      }
      queryClient.setQueryData(["user-emails", userId], data);
      toast.success("Email set as primary successfully", {
        id: "set-primary-email",
      });
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        toast.error(error.data?.errors.map((e: any) => e.message).join("\n"));
        return;
      }
      toast.error(error.message);
    },
  });

  const {
    mutate: resendEmailVerificationMutation,
    isPending: isResendEmailVerificationPending,
  } = useMutation({
    mutationFn: async (email: string) => {
      return await resentEmailVerification(email);
    },
    onSuccess: () => {
      toast.success("Email verification resent successfully");
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        if (error.status === 403) {
          toast.error("Too many requests. Please try again later.");
          return;
        }
        toast.error(error.data?.errors.map((e: any) => e.message).join("\n"));
        return;
      }
      toast.error(error.message);
    },
  });

  if (!userId) return null;

  return (
    <Card className="mt-10" asChild>
      <form>
        <CardContent className="flex flex-col p-4 sm:p-6">
          <h3 className="text-lg font-bold">Email</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the email addresses you want to use to log in. Your primary
            email will be used for account-related notifications.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {isUserEmailsLoading ? (
              <Skeleton className="flex h-14 items-center gap-2 px-4">
                <Skeleton className="bg-background h-1/2 w-1/4" />
                <Skeleton className="bg-background h-1/2 w-1/12" />
                <Skeleton className="bg-background h-1/2 w-1/12" />
              </Skeleton>
            ) : !userEmails ? (
              <AddEmailDialog userId={userId} />
            ) : (
              userEmails.map(({ email, primary, verified }) => (
                <div
                  key={email}
                  className="flex items-center justify-between rounded-lg border px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{email}</span>
                    {verified ? (
                      <Badge variant="defaultOutline">Verified</Badge>
                    ) : (
                      <Badge variant="destructiveOutline">Unverified</Badge>
                    )}
                    {primary ? <Badge variant="success">Primary</Badge> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {!verified ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resendEmailVerificationMutation(email);
                        }}
                        disabled={isResendEmailVerificationPending}
                      >
                        {isResendEmailVerificationPending ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Resend verification email"
                        )}
                      </Button>
                    ) : null}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                        >
                          <Ellipsis />
                          <span className="sr-only">Open menu for {email}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {!primary ? (
                          <DropdownMenuItem
                            aria-label="Set as primary email"
                            className="cursor-pointer"
                            onClick={() => {
                              setPrimaryEmailMutation(email);
                            }}
                            disabled={isSetPrimaryEmailPending || !verified}
                          >
                            Set as primary
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          disabled={primary || !verified}
                          aria-label={
                            primary
                              ? "You can't delete the primary email"
                              : "Delete email"
                          }
                          title={
                            primary
                              ? "You can't delete the primary email"
                              : "Delete email"
                          }
                          className={`
                            text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/20
                            hover:bg-destructive/20
                          `}
                          onClick={() => {
                            setShowDeleteEmailDialog(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <AlertDialog
                    open={showDeleteEmailDialog}
                    onOpenChange={setShowDeleteEmailDialog}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove this email ({email}) from your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => deleteEmailMutation(email)}
                          disabled={isDeleteEmailPending}
                        >
                          {isDeleteEmailPending ? (
                            <Loader className="animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
          {userEmails && userEmails.length < 3 ? (
            <AddEmailDialog userId={userId} />
          ) : null}
        </CardContent>
        <CardFooter>
          <CardFooterDescription>
            Emails must be verified to be able to login with them or be used as
            primary email. You can add up to 3 emails.
          </CardFooterDescription>
        </CardFooter>
      </form>
    </Card>
  );
}
