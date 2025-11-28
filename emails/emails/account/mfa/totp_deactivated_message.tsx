import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

export default function TotpDeactivated() {
  const title = translate("Authenticator App Deactivated");
  const text = translate(
    "An authenticator app has been deactivated for your account.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "An authenticator app has been deactivated for your <strong>{{site_name}}</strong> account.",
        )}
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
