import { BaseAuthFormWithCode } from "./base-2fa-code";

export default function AuthWithTOTPPage() {
  return <BaseAuthFormWithCode type="totp" />;
}
