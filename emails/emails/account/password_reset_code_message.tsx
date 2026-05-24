import { Link, Section } from "react-email";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";

interface PasswordResetCodeProps {
  readonly code?: string;
}

export default function PasswordResetCode({
  code = "{{ code }}",
}: PasswordResetCodeProps) {
  const title = translate("Reset Your Password");
  const text = translate("We received a request to reset your password.");
  const resetUrl = resolveUrl("/auth/password/reset", { code });

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          `We received a request to reset the password for your account on <strong>{{site_name}}</strong>. Use the code below to proceed with the password reset.`,
        )}
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-5 text-center">
        <Text className="text-muted-foreground m-0 mb-2.5 text-xs font-bold tracking-wider uppercase">
          {translate("Reset Code")}
        </Text>
        <Text className="text-foreground m-0 font-mono text-3xl font-bold tracking-[8px]">
          {code}
        </Text>
      </Section>

      <Section className="mt-2.5 mb-8 text-center">
        <Button href={resetUrl}>{translate("Reset Password")}</Button>
      </Section>

      <Text className="mb-0 text-sm">
        {translate("Or you can copy and paste this link into your browser:")}
      </Text>
      <Text className="text-primary mt-1 text-xs break-all">
        <Link href={resetUrl} className="text-primary underline">
          {resetUrl}
        </Link>
      </Text>

      <NotMakeThisChange
        text={translate(
          "If you did not request this, please ignore this email. Your password will remain unchanged, and no further action is required.",
        )}
        addSupportContact={false}
        isNotRequested={false}
      />
    </Layout>
  );
}
