import { Link, Section } from "@react-email/components";
import { Button } from "@/components/button";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { resolveUrl } from "@/utils/urls";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

interface PasswordResetCodeProps {
  readonly username?: string;
  readonly siteName?: string;
  readonly code?: string;
}

export default function PasswordResetCode({
  username = USERNAME,
  siteName = SITE_NAME,
  code = "{{ code }}",
}: PasswordResetCodeProps) {
  const title = "Reset Your Password";
  const text = `Hello, ${username}. We received a request to reset the password for your ${siteName} account.`;
  const resetUrl = resolveUrl("/auth/password/reset", { code });

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        We received a request to reset the password for your account on{" "}
        <strong>{siteName}</strong>. Use the code below to proceed with the
        password reset.
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-5 text-center">
        <Text className="text-muted-foreground m-0 mb-2.5 text-xs font-bold tracking-wider uppercase">
          Reset Code
        </Text>
        <Text className="text-foreground m-0 font-mono text-3xl font-bold tracking-[8px]">
          {code}
        </Text>
      </Section>

      <Section className="mt-2.5 mb-8 text-center">
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Text className="mb-0 text-sm">
        Or you can copy and paste this link into your browser:
      </Text>
      <Text className="text-primary mt-1 text-xs break-all">
        <Link href={resetUrl} className="text-primary underline">
          {resetUrl}
        </Link>
      </Text>

      <NotMakeThisChange
        text="If you did not request this, please ignore this email. Your password will remain unchanged, and no further action is required."
        addSupportContact={false}
        isNotRequested={false}
      />
    </Layout>
  );
}
