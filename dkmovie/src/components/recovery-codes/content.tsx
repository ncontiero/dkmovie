import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { getRecoveryCodes } from "@/http/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";
import { CopyButton } from "../ui/copy-button";

interface RecoveryCodesContentProps {
  readonly onReAuthenticationCancel?: () => void;
}

export function RecoveryCodesContent({
  onReAuthenticationCancel,
}: RecoveryCodesContentProps) {
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();

  const {
    data: recoveryCodes,
    isLoading: isGettingRecoveryCodes,
    error: getRecoveryCodesError,
    refetch: getRecoveryCodesRefetch,
  } = useQuery({
    queryKey: ["recovery-codes"],
    queryFn: async () => await getRecoveryCodes(),
    select: (data) => data.data,
  });

  if (needReAuthentication(getRecoveryCodesError)) {
    initializeReAuthentication({
      onReAuthenticated: getRecoveryCodesRefetch,
      onCancel: onReAuthenticationCancel,
    });
    return null;
  }

  if (isReAuthenticating) return null;

  if (isGettingRecoveryCodes) {
    return (
      <div className="flex h-44 w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
        <Loader className="animate-spin" />
      </div>
    );
  }

  const codes = recoveryCodes?.unused_codes || [];

  return (
    <div className="w-full rounded-lg border">
      <div className="flex flex-col items-center justify-center gap-4 p-4 pb-6">
        <div className="grid grid-cols-5 grid-rows-2 gap-5 font-mono">
          {codes.map((code) => (
            <div key={code} className="text-center">
              {code}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-secondary/80 lg flex items-center justify-end rounded-b border-t p-2">
        <CopyButton value={codes.join("\n")} variant="outline" size="sm">
          Copy
        </CopyButton>
      </div>
    </div>
  );
}
