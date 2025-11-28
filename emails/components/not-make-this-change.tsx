import { Link, Section } from "@react-email/components";
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
    <Section className="bg-muted border-border my-5 rounded-sm border p-5">
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
            className="text-primary mr-2 font-semibold underline"
          >
            {translate("Reset Password")}
          </Link>
        ) : null}
        {addSupportContact ? (
          <Link
            href={resolveUrl("/contact")}
            className="text-destructive font-semibold underline"
          >
            {translate("Contact Support")}
          </Link>
        ) : null}
      </Text>
    </Section>
  );
}
