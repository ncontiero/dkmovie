import type { PropsWithChildren } from "react";
import {
  type TailwindConfig,
  Body,
  Container,
  Head,
  Heading,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import { SITE_NAME } from "@/utils/constants";
import { Footer } from "./footer";
import { Header } from "./header";

export interface LayoutProps extends PropsWithChildren {
  readonly previewText: string;
  readonly title?: string;
  readonly siteName?: string;
}

const tailwindConfig: TailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        background: "#fff",
        foreground: "#121212",
        primary: {
          DEFAULT: "#7f22fe",
          foreground: "#f9fafb",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          foreground: "#121212",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#666",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f9fafb",
        },
      },
    },
  },
};

export function Layout({
  title,
  previewText,
  children,
  siteName = SITE_NAME,
}: LayoutProps) {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>{previewText}</Preview>

        <Body className="bg-background m-auto px-2 font-sans">
          <Container className="border-border mx-auto my-10 max-w-[500px] rounded-[6px] border border-solid p-5">
            <Header siteName={siteName} />

            <Section>
              {title ? (
                <Heading
                  as="h2"
                  className="text-foreground my-6 text-center text-2xl font-semibold"
                >
                  {title}
                </Heading>
              ) : null}

              {children}
            </Section>

            <Footer siteName={siteName} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
