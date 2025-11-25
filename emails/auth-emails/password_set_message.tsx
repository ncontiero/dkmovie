import PasswordChanged, {
  type PasswordChangedProps,
} from "./password_changed_message";

export default function PasswordSet(props: PasswordChangedProps) {
  return <PasswordChanged {...props} isPasswordSet />;
}
