import { createFileRoute } from "@tanstack/react-router";
import { AuthWithCode } from "@/components/auth-with-code";

export const Route = createFileRoute("/auth/2fa/totp")({
  component: AuthWithTOTPComponent,
});

function AuthWithTOTPComponent() {
  return <AuthWithCode type="2fa" codeType="totp" />;
}
