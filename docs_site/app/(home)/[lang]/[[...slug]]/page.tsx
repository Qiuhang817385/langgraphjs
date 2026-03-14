import { source, sourceCn } from "@/app/source";
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const LANG_CN = "docs_cn";
const LANG_EN = "docs";
type Locale = "en" | "cn";

function getSource(locale: Locale) {
  return locale === "cn" ? sourceCn : source;
}

function parseLang(lang: string | undefined): Locale | null {
  if (lang === LANG_CN) return "cn";
  if (lang === LANG_EN) return "en";
  return null;
}

/** 保证 slug 为 string[]，避免 params 异常导致 slugs.join/segment.replace 报错 */
function normalizeSlug(slug: unknown): string[] {
  if (Array.isArray(slug)) return slug.map((s) => String(s));
  if (typeof slug === "string") return [slug];
  return [];
}

interface PageProps {
  params: Promise<{
    lang: string;
    slug?: string[] | unknown;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = parseLang(lang);
  if (!locale) notFound();

  const rest = normalizeSlug(slug);
  const currentSource = getSource(locale);
  const page = currentSource.getPage(rest);

  if (!page) notFound();

  const { body: MDX, toc, title, description } = await page.data;

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        enabled: true,
        header: "On this page",
      }}
    >
      <DocsTitle>{title}</DocsTitle>
      {description && <DocsDescription>{description}</DocsDescription>}
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const [enParams, cnParams] = await Promise.all([
    source.generateParams(),
    sourceCn.generateParams(),
  ]);

  const toLangSlug = (lang: string) => (p: { slug?: string[] | unknown }) => {
    const rest = normalizeSlug(p.slug);
    return { lang, slug: rest };
  };

  const en = enParams.map(toLangSlug(LANG_EN));
  const cn = cnParams.map(toLangSlug(LANG_CN));
  return [...en, ...cn];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLang(lang);
  if (!locale) notFound();

  const rest = normalizeSlug(slug);
  const page = getSource(locale).getPage(rest);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
