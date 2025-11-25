import { Section } from "@react-email/components";
import { Button } from "@/components/button";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { resolveUrl } from "@/utils/urls";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

export interface PasswordChangedProps {
  readonly username?: string;
  readonly siteName?: string;
  readonly isResetPassword?: boolean;
  readonly isPasswordSet?: boolean;
}

export default function PasswordChanged({
  username = USERNAME,
  siteName = SITE_NAME,
  isResetPassword = false,
  isPasswordSet = false,
}: PasswordChangedProps) {
  const titleAction = isResetPassword
    ? "Reset"
    : isPasswordSet
      ? "Set"
      : "Change";

  const title = `Password ${titleAction} Successful`;
  const text = `Hello, ${username}. This email is to confirm that the password for your ${siteName} account has been successfully ${titleAction.toLowerCase()}.`;

  const loginUrl = resolveUrl("/auth/sign-in");

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 mb-0 text-sm">
        This email is to confirm that the password for your{" "}
        <strong>{siteName}</strong> account has been successfully{" "}
        {titleAction.toLowerCase()}.
      </Text>

      <Text className="mt-2 text-sm">
        You can now log in using your new password.
      </Text>

      <Section className="my-8 text-center">
        <Button href={loginUrl}>Log In</Button>
      </Section>

      <NotMakeThisChange addResetPassword />
      <RequestOrigins />
    </Layout>
  );
}
