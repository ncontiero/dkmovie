import type { AnyRouteMatch } from "@tanstack/react-router";
import type { useTranslations } from "use-intl";

export type MetadataTranslations = ReturnType<
  typeof useTranslations<"metadata">
>;
interface MetaProps {
  readonly overrideTitle?: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly imageAlt?: string;
  isOnlyBase?: boolean;
  metadataTranslations: MetadataTranslations;
}

const metaValues: Partial<MetaProps> = {
  title: "DKMovie",
};

export function generateMetadata({
  metadataTranslations: t,
  overrideTitle = false,
  isOnlyBase = false,
  title,
  image,
  imageAlt,
  ...props
}: MetaProps): { meta: AnyRouteMatch["meta"]; links?: AnyRouteMatch["links"] } {
  const description = props.description ?? t("description");

  const location = window.location;
  const url = location.href;
  const baseUrl = location.origin;
  const imageUrl = image && `${baseUrl}${image}`;

  const titleToUse = overrideTitle
    ? title || metaValues.title
    : `${title} • ${metaValues.title}`;

  const baseMeta: AnyRouteMatch["meta"] = [
    { title: titleToUse },
    { name: "description", content: description },
  ];

  if (isOnlyBase) return { meta: baseMeta };

  return {
    meta: [
      ...baseMeta,

      // OG
      { property: "og:title", content: titleToUse },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      ...(imageUrl
        ? [
            { property: "og:image", content: imageUrl },
            { property: "og:image:alt", content: imageAlt },
          ]
        : []),

      // Twitter
      {
        name: "twitter:card",
        content: imageUrl ? "summary_large_image" : "summary",
      },
      { name: "twitter:title", content: titleToUse },
      { name: "twitter:description", content: description },
      ...(imageUrl
        ? [
            { property: "twitter:image", content: imageUrl },
            { property: "twitter:image:alt", content: imageAlt },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
