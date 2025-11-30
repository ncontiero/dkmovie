import { useEffect } from "react";
import { useTranslations } from "use-intl";

interface MetaProps {
  readonly overrideTitle?: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly imageAlt?: string;
}

const metaValues: MetaProps = {
  title: "DKMovie",
};

function createMetaTag(props: Record<string, string>) {
  const existingMetaTag = document.querySelector(
    `meta[${props.property ? `property="${props.property}"` : `name="${props.name}"`}]`,
  );

  if (existingMetaTag) {
    existingMetaTag.setAttribute("content", props.content);
    return;
  }

  const meta = document.createElement("meta");
  Object.entries(props).forEach(([key, value]) => {
    meta.setAttribute(key, value);
  });

  document.head.append(meta);
}

function removeMetaTag(props: Record<string, string>) {
  const meta = document.querySelector(
    `meta[${props.property ? `property="${props.property}"` : `name="${props.name}"`}]`,
  );

  if (meta) {
    meta.remove();
  }
}

export function Meta({
  overrideTitle = false,
  title,
  image,
  imageAlt,
  ...props
}: MetaProps) {
  const t = useTranslations("metadata");

  const description = props.description ?? t("description");
  const baseUrl = window.location.origin;
  const imageUrl = image && `${baseUrl}${image}`;

  useEffect(() => {
    if (overrideTitle) {
      document.title = title ?? metaValues.title!;
    } else {
      document.title = `${title} • ${metaValues.title}`;
    }

    createMetaTag({ name: "description", content: description });

    // OG
    createMetaTag({ property: "og:title", content: document.title });
    createMetaTag({ property: "og:description", content: description });
    createMetaTag({ property: "og:type", content: "website" });
    createMetaTag({ property: "og:url", content: window.location.href });
    if (imageUrl) {
      createMetaTag({ property: "og:image", content: imageUrl });
      if (imageAlt) {
        createMetaTag({ property: "og:image:alt", content: imageAlt });
      }
    } else {
      removeMetaTag({ property: "og:image" });
      removeMetaTag({ property: "og:image:alt" });
    }

    // Twitter
    createMetaTag({
      name: "twitter:card",
      content: imageUrl ? "summary_large_image" : "summary",
    });
    createMetaTag({ name: "twitter:title", content: document.title });
    createMetaTag({ name: "twitter:description", content: description });
    if (imageUrl) {
      createMetaTag({ name: "twitter:image", content: imageUrl });
      if (imageAlt) {
        createMetaTag({ name: "twitter:image:alt", content: imageAlt });
      }
    } else {
      removeMetaTag({ name: "twitter:image" });
      removeMetaTag({ name: "twitter:image:alt" });
    }
  }, [description, imageAlt, imageUrl, overrideTitle, title]);

  return null;
}
