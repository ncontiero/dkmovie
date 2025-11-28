import { Link, Section } from "@react-email/components";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";

interface AccountAlreadyExistsEmailProps {
  readonly loginUrl?: string;
  readonly resetPasswordUrl?: string;
}

export default function AccountAlreadyExistsEmail({
  loginUrl = resolveUrl("/auth/sign-in"),
  resetPasswordUrl = "{{ password_reset_url }}",
}: AccountAlreadyExistsEmailProps) {
  const title = translate("Account Already Exists");
  const text = translate(
    "We noticed a registration attempt using the email {{email}}.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translate("We noticed a registration attempt using the email")}{" "}
        <span className="text-primary">{`{{email}}`}</span>.{" "}
        {translateWithSiteName(
          `However, an account already exists on <strong>{{site_name}}</strong> with this address.`,
        )}
      </Text>

      <Text className="text-sm">
        {translate(
          "If you tried to create this account, you can log in now to access your favorite movies and series.",
        )}
      </Text>

      <Section className="my-8 text-center">
        <Button href={loginUrl}>{translate("Log in")}</Button>
      </Section>

      <Text className="mb-0 text-sm">
        {translate(`Forgot your password? No problem.`)}{" "}
        <Link href={resetPasswordUrl} className="text-primary underline">
          {translate("Click here to reset your password.")}
        </Link>
      </Text>

      <Text className="mt-2 text-sm">
        {translate(
          "If you didn't try to create an account recently, you can safely ignore this email.",
        )}
      </Text>
    </Layout>
  );
}
