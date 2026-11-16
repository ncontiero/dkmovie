import { Section } from "react-email";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

interface LoginCodeProps {
  readonly code?: string;
}

export default function LoginCode({ code = "{{ code }}" }: LoginCodeProps) {
  const title = translate("Sign-In Code");
  const text = translate(
    "Use the code below to verify your identity and continue.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          `Use the verification code below to sign in or verify your identity on <strong>{{site_name}}</strong>. Please enter it in your open browser window.`,
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

      <NotMakeThisChange
        text={translate(
          "This email can be safely ignored if you did not initiate this action.",
        )}
        addSupportContact={false}
        isNotRequested={false}
      />
    </Layout>
  );
}
