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

      <Section className="my-5 rounded-sm border border-border bg-muted p-5 text-center">
        <Text className="m-0 mb-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {translate("Verification Code")}
        </Text>
        <Text className="m-0 font-mono text-3xl font-bold tracking-[8px] text-foreground">
          {code}
        </Text>
      </Section>

      <Section className="mt-2.5 mb-8 text-center">
        <Button href={verificationUrl}>{translate("Verify Email")}</Button>
      </Section>

      <Text className="mb-0 text-sm">
        {translate("Or you can copy and paste this link into your browser:")}
      </Text>
      <Text className="mt-1 text-xs break-all text-primary">
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
