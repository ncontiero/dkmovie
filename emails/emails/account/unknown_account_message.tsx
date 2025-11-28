import { Section } from "@react-email/components";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

interface UnknownAccountProps {
  readonly signupUrl?: string;
}

export default function UnknownAccount({
  signupUrl = "{{ signup_url }}",
}: UnknownAccountProps) {
  const title = translate("Account Not Found");
  const text = translate(
    "You are receiving this email because you, or someone else, tried to access or reset a password for an account.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 mb-0 text-sm">
        {translate(
          "You are receiving this email because you, or someone else, tried to access or reset a password for an account associated with <strong>{{email}}</strong>.",
        )}
      </Text>

      <Text className="mt-2 mb-0 text-sm">
        {translate(
          "However, we do not have any record of an account with this email address in our database.",
        )}
      </Text>

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "If you would like to join <strong>{{site_name}}</strong>, you can sign up for a new account using the link below.",
        )}
      </Text>

      <Section className="my-8 text-center">
        <Button href={signupUrl}>{translate("Create an Account")}</Button>
      </Section>

      <NotMakeThisChange
        isNotRequested={false}
        text={translate(
          "This email can be safely ignored if you did not try to access our site. It is likely a typo by someone else entering their email address.",
        )}
        addSupportContact={false}
      />
    </Layout>
  );
}
