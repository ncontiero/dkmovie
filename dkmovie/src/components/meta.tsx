import { useEffect } from "react";

interface MetaProps {
  readonly overrideTitle?: boolean;
  readonly title?: string;
  readonly description?: string;
}

const metaValues: MetaProps = {
  title: "DKMovie",
  description: "A Django project of films and series.",
};

export function Meta({ overrideTitle = false, title, ...props }: MetaProps) {
  const description = props.description ?? metaValues.description;

  useEffect(() => {
    if (overrideTitle) {
      document.title = title ?? metaValues.title!;
    } else {
      document.title = `${title} • ${metaValues.title}`;
    }

    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description);
    }
  }, [description, overrideTitle, title]);

  return null;
}
