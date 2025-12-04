import { Section } from "@react-email/components";
import { Button } from "@/components/button";
import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";
import { resolveUrl } from "@/utils/urls";

const canDoItems = [
  {
    title: translate("Discover:"),
    description: translate("Explore our vast collection of movies and series."),
  },
  {
    title: translate("Watchlist:"),
    description: translate("Keep track of what you want to watch next."),
  },
];

export default function WelcomeMessage() {
  const title = translateWithSiteName("Welcome to {{ site_name }}!");
  const text = translateWithSiteName(
    "Welcome to {{site_name}}! Your journey to discover movies and series starts here.",
  );
  const profileUrl = resolveUrl("/account");

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          "Thanks for joining <strong>{{site_name}}</strong>! We're thrilled to have you in our community of movie and series enthusiasts.",
        )}
      </Text>

      <Text className="text-sm">
        {translate("Here is what you can do now:")}
      </Text>

      <ul className="mt-2 mb-4 list-disc pl-5 text-sm">
        {canDoItems.map(({ title, description }) => (
          <li key={title}>
            <strong>{title}</strong> {description}
          </li>
        ))}
      </ul>

      <Section className="my-8 text-center">
        <Button href={profileUrl}>{translate("Go to your Account")}</Button>
      </Section>
    </Layout>
  );
}
