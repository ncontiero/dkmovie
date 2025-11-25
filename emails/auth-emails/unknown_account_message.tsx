import { Section } from "@react-email/components";
import { Button } from "@/components/button";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { SITE_NAME } from "@/utils/constants";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

interface UnknownAccountProps {
  readonly siteName?: string;
  readonly email?: string;
  readonly signupUrl?: string;
}

export default function UnknownAccount({
  siteName = SITE_NAME,
  email = "{{ email }}",
  signupUrl = "{{ signup_url }}",
}: UnknownAccountProps) {
  const title = "Account Not Found";
  const text = `Hello. You are receiving this email because you, or someone else, tried to access or reset a password for an account associated with ${email}. However, we do not have any record of an account with this email address in our database.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">Hello.</Text>

      <Text className="mt-2 mb-0 text-sm">
        You are receiving this email because you, or someone else, tried to
        access or reset a password for an account associated with{" "}
        <strong>{email}</strong>.
      </Text>

      <Text className="mt-2 mb-0 text-sm">
        However, we do not have any record of an account with this email address
        in our database.
      </Text>

      <Text className="mt-2 text-sm">
        If you would like to join <strong>{siteName}</strong>, you can sign up
        for a new account using the link below.
      </Text>

      <Section className="my-8 text-center">
        <Button href={signupUrl}>Create an Account</Button>
      </Section>

      <NotMakeThisChange
        isNotRequested={false}
        text="This email can be safely ignored if you did not try to access our site. It is likely a typo by someone else entering their email address."
        addSupportContact={false}
      />
    </Layout>
  );
}
