import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

export default function RecoveryCodesGenerated() {
  const title = translate("Recovery Codes Generated");
  const text = translate(
    "A new set of Two-Factor Authentication recovery codes has been generated for your account.",
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "A new set of Two-Factor Authentication recovery codes has been generated for your <strong>{{site_name}}</strong> account.",
        )}
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
