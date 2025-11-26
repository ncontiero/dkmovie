import { AuthWithCode } from "@/components/auth-with-code";

export default function AuthWithTOTPPage() {
  return <AuthWithCode type="2fa" codeType="totp" />;
}
