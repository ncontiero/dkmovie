import EmailConfirmation, {
  type EmailConfirmationProps,
} from "./email_confirmation_message";

export default function EmailConfirmationSignUp(props: EmailConfirmationProps) {
  return <EmailConfirmation {...props} isSignUp />;
}
