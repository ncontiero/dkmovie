import { Link, Section } from "@react-email/components";
import { Button } from "@/components/button";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { resolveUrl } from "@/utils/urls";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

interface AccountAlreadyExistsEmailProps {
  readonly username?: string;
  readonly emailAddress?: string;
  readonly loginUrl?: string;
  readonly resetPasswordUrl?: string;
  readonly siteName?: string;
}

export default function AccountAlreadyExistsEmail({
  username = USERNAME,
  emailAddress = "{{ email }}",
  loginUrl = resolveUrl("/auth/sign-in"),
  resetPasswordUrl = "{{ password_reset_url }}",
  siteName = SITE_NAME,
}: AccountAlreadyExistsEmailProps) {
  const title = "Account already exists";
  const text = `Hello, ${username}. We noticed a registration attempt using the email ${emailAddress}. However, an account already exists on ${siteName} with this address.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        We noticed a registration attempt using the email{" "}
        <span className="text-primary">{emailAddress}</span>. However, an
        account already exists on <strong>{siteName}</strong> with this address.
      </Text>

      <Text className="text-sm">
        If you tried to create this account, you can log in now to access your
        favorite movies and series.
      </Text>

      <Section className="my-8 text-center">
        <Button href={loginUrl}>Log in</Button>
      </Section>

      <Text className="mb-0 text-sm">
        Forgot your password? No problem.{" "}
        <Link href={resetPasswordUrl} className="text-primary underline">
          Click here to reset your password.
        </Link>
      </Text>

      <Text className="mt-2 text-sm">
        If you didn&apos;t try to create an account recently, you can safely
        ignore this email.
      </Text>
    </Layout>
  );
}
