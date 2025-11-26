import { AuthWithCode } from "@/components/auth-with-code";

export default function AuthWithRecoveryCodePage() {
  return <AuthWithCode type="2fa" codeType="recovery_codes" />;
}
