import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { deleteTOTP } from "@/http/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";

export function RemoveTOTP() {
  const queryClient = useQueryClient();
  const { session, initializeReAuthentication, isReAuthenticating } =
    useSession();

  const userId = session?.user.id;

  const { mutate: deleteTOTPMutation, isPending: isDeletingTOTP } = useMutation(
    {
      mutationFn: async () => await deleteTOTP(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["setup-totp", userId] });
        queryClient.invalidateQueries({ queryKey: ["recovery-codes", userId] });
        queryClient.invalidateQueries({ queryKey: ["2fa", userId] });
        toast.success("Removed TOTP successfully");
      },
      onError: (error) => {
        if (needReAuthentication(error)) {
          initializeReAuthentication(deleteTOTPMutation);
          return;
        }

        console.error(error);
        toast.error("Something went wrong");
      },
    },
  );

  return (
    !isReAuthenticating && (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Remove
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove TOTP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your TOTP?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeletingTOTP}
                onClick={() => deleteTOTPMutation()}
              >
                {isDeletingTOTP ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Remove"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
}
