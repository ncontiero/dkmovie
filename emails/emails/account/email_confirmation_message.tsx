import { Link, Section } from "react-email";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";

export interface EmailConfirmationProps {
  readonly code?: string;
  readonly isSignUp?: boolean;
}

export default function EmailConfirmation({
  code = "{{ code }}",
  isSignUp = false,
}: EmailConfirmationProps) {
  const title = translate("Confirm Your Email");
  const text = translate("Please verify your email address.");
  const verificationUrl = resolveUrl("/account/verify-email", { code });

  const requestText =
    "If you didn't request this, you can safely ignore this email.";
  const signUpChangeText =
    "If you didn't create an account with {{site_name}}, you can safely ignore this email.";

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          `Please use the verification code below to confirm your email address${isSignUp ? " and finish setting up your account" : ""} on <strong>{{site_name}}</strong>.`,
        )}
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-5 text-center">
        <Text className="text-muted-foreground m-0 mb-2.5 text-xs font-bold tracking-wider uppercase">
          {translate("Verification Code")}
        </Text>
        <Text className="text-foreground m-0 font-mono text-3xl font-bold tracking-[8px]">
          {code}
        </Text>
      </Section>

      <Section className="mt-2.5 mb-8 text-center">
        <Button href={verificationUrl}>{translate("Verify Email")}</Button>
      </Section>

      <Text className="mb-0 text-sm">
        {translate("Or you can copy and paste this link into your browser:")}
      </Text>
      <Text className="text-primary mt-1 text-xs break-all">
        <Link href={verificationUrl} className="text-primary underline">
          {verificationUrl}
        </Link>
      </Text>

      <NotMakeThisChange
        text={translateWithSiteName(
          `${isSignUp ? signUpChangeText : requestText} It's possible someone entered your email address by mistake.`,
        )}
        addSupportContact={false}
        isNotRequested={false}
      />
    </Layout>
  );
}
