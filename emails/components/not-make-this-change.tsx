import { Link, Section } from "react-email";
import { translate } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";
import { Text } from "./text";

interface NotMakeThisChangeProps {
  readonly addSupportContact?: boolean;
  readonly addResetPassword?: boolean;
  readonly text?: string;
  readonly isNotRequested?: boolean;
}

export function NotMakeThisChange({
  addSupportContact = true,
  isNotRequested = true,
  addResetPassword = false,
  text,
}: NotMakeThisChangeProps) {
  const defaultText = translate(
    "If you do not recognize this change then please take proper security precautions immediately.",
  );

  return (
    <Section className="my-5 rounded-sm border border-border bg-muted p-5">
      <Text className="m-0 mb-2.5 text-sm font-bold">
        {isNotRequested
          ? translate("Didn't make this change?")
          : translate("Didn't request this?")}
      </Text>
      <Text className="m-0 text-sm">{text || defaultText}</Text>
      <Text className="m-0 mt-2.5 text-sm">
        {addResetPassword ? (
          <Link
            href={resolveUrl("/auth/password/forgot", {
              email: "{{ to_email|default:email }}",
            })}
            className="mr-2 font-semibold text-primary underline"
          >
            {translate("Reset Password")}
          </Link>
        ) : null}
        {addSupportContact ? (
          <Link
            href={resolveUrl("/contact")}
            className="font-semibold text-destructive underline"
          >
            {translate("Contact Support")}
          </Link>
        ) : null}
      </Text>
    </Section>
  );
}
