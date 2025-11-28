import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

export default function TotpActivated() {
  const title = translate("Authenticator App Activated");
  const text = translate(
    "An authenticator app has been activated for your account.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "An authenticator app has been activated for your <strong>{{site_name}}</strong> account.",
        )}
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
