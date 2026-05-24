import { Section } from "react-email";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

interface EmailChangedProps {
  readonly oldEmail?: string;
  readonly newEmail?: string;
}

export default function EmailChanged({
  oldEmail = "{{ from_email }}",
  newEmail = "{{ to_email }}",
}: EmailChangedProps) {
  const title = translate("Email Changed");
  const text = translate(
    "We are sending this message to confirm that your email address has been changed.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "We are sending this message to confirm that the email address associated with your <strong>{{site_name}}</strong> account has been changed.",
        )}
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-3.5">
        <Text className="m-0 mb-2.5 text-sm">
          <strong className="text-muted-foreground text-xs tracking-wider uppercase">
            {translate("From:")}
          </strong>
          <br />
          <span className="font-mono text-base">{oldEmail}</span>
        </Text>

        <Text className="text-primary m-0 mb-2.5 text-lg leading-none">↓</Text>

        <Text className="m-0 text-sm">
          <strong className="text-muted-foreground text-xs tracking-wider uppercase">
            {translate("To:")}
          </strong>
          <br />
          <span className="font-mono text-base font-semibold">{newEmail}</span>
        </Text>
      </Section>

      <Text className="text-sm">
        {translate("If you made this change, no further action is required.")}
      </Text>

      <NotMakeThisChange addResetPassword />
      <RequestOrigins />
    </Layout>
  );
}
