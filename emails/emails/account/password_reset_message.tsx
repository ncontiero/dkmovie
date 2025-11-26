import PasswordChanged, {
  type PasswordChangedProps,
} from "./password_changed_message";

export default function PasswordReset(props: PasswordChangedProps) {
  return <PasswordChanged {...props} isResetPassword />;
}
