import { Link, Section } from "@react-email/components";
import { Button } from "@/components/button";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { resolveUrl } from "@/utils/urls";

export interface EmailConfirmationProps {
  readonly username?: string;
  readonly siteName?: string;
  readonly code?: string;
  readonly isSignUp?: boolean;
}

export default function EmailConfirmation({
  username = USERNAME,
  siteName = SITE_NAME,
  code = "{{ code }}",
  isSignUp = false,
}: EmailConfirmationProps) {
  const title = "Confirm Your Email";
  const text = `Hello, ${username}. Please use the verification code below to confirm your email address ${
    isSignUp ? "and finish setting up your account" : ""
  } on ${siteName}.`;
  const verificationUrl = resolveUrl("/account/verify-email", { code });

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        Please use the verification code below to confirm your email address
        {isSignUp ? " and finish setting up your account" : ""} on{" "}
        <strong>{siteName}</strong>.
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-5 text-center">
        <Text className="text-muted-foreground m-0 mb-2.5 text-xs font-bold tracking-wider uppercase">
          Verification Code
        </Text>
        <Text className="text-foreground m-0 font-mono text-3xl font-bold tracking-[8px]">
          {code}
        </Text>
      </Section>

      <Section className="mt-2.5 mb-8 text-center">
        <Button href={verificationUrl}>Verify Email</Button>
      </Section>

      <Text className="mb-0 text-sm">
        Or you can copy and paste this link into your browser:
      </Text>
      <Text className="text-primary mt-1 text-xs break-all">
        <Link href={verificationUrl} className="text-primary underline">
          {verificationUrl}
        </Link>
      </Text>

      <NotMakeThisChange
        text={`${
          isSignUp
            ? `If you didn't create an account with ${siteName}, you can safely ignore this email.`
            : `If you didn't request this, you can safely ignore this email.`
        } It's possible someone entered your email address by mistake.`}
        addSupportContact={false}
        isNotRequested={false}
      />
    </Layout>
  );
}
