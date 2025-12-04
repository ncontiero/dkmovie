import { createFileRoute } from "@tanstack/react-router";
import { AuthWithCode } from "@/components/auth-with-code";

export const Route = createFileRoute("/auth/2fa/recovery-codes")({
  component: AuthWithRecoveryCodeComponent,
});

function AuthWithRecoveryCodeComponent() {
  return <AuthWithCode type="2fa" codeType="recovery_codes" />;
}
