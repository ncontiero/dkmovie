import { Column, Link, Row, Section } from "@react-email/components";
import { Layout } from "@/components/layout";
import { Text } from "@/components/text";
import { resolveUrl } from "@/utils/urls";

export default function TitleAdded() {
  const title = "Titles added/updated";
  const text = "New titles have been added to the platform.";

  return (
    <Layout title={title} previewText={text}>
      <Text className="mb-0 text-sm">Hello, Admin!</Text>

      <Text className="mt-2 mb-0 text-sm">{text}</Text>
      <Link
        href={resolveUrl("{{ see_all_url }}")}
        className="text-primary my-0 text-sm"
      >
        Click here to see all the titles.
      </Link>

      <Text className="mt-2 text-sm">
        Here are the links to the admin panel:
      </Text>

      {`{% for link in title_links %}`}
      <Section className="mb-3">
        <Row className="pr-8 pl-2">
          <Column className="size-6 pr-3">
            <Row>
              <Column
                align="center"
                valign="middle"
                className="bg-primary text-primary-foreground size-6 rounded-full text-sm leading-none font-semibold"
              >
                {`{{ forloop.counter }}`}
              </Column>
            </Row>
          </Column>
          <Column valign="top">
            <Text className="text-muted-foreground m-0 text-sm">
              <Link
                href={resolveUrl(`{{ link.admin_url }}`)}
                className="text-primary"
              >
                {`{% if link.title %}`}
                {`{{ link.title }}`}
                {`{% else %}`}
                Untitled
                {`{% endif %}`}
              </Link>
            </Text>
          </Column>
        </Row>
      </Section>
      {`{% endfor %}`}
    </Layout>
  );
}
