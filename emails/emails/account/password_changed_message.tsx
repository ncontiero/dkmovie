import { Section } from "@react-email/components";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";

export interface PasswordChangedProps {
  readonly isResetPassword?: boolean;
  readonly isPasswordSet?: boolean;
}

export default function PasswordChanged({
  isResetPassword = false,
  isPasswordSet = false,
}: PasswordChangedProps) {
  const titleAction = isResetPassword
    ? "Reset"
    : isPasswordSet
      ? "Set"
      : "Changed";

  const title = translate(`Password ${titleAction} Successfully`);
  const text = translate(
    `This email is to confirm that your password has been successfully ${titleAction.toLowerCase()}.`,
  );

  const loginUrl = resolveUrl("/auth/sign-in");

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 mb-0 text-sm">
        {translateWithSiteName(
          `This email is to confirm that the password for your <strong>{{site_name}}</strong> account has been successfully ${titleAction.toLowerCase()}.`,
        )}
      </Text>

      <Text className="mt-2 text-sm">
        {translate("You can now log in using your new password.")}
      </Text>

      <Section className="my-8 text-center">
        <Button href={loginUrl}>{translate("Log In")}</Button>
      </Section>

      <NotMakeThisChange addResetPassword />
      <RequestOrigins />
    </Layout>
  );
}
