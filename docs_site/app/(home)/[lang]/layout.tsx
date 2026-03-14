import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { source, sourceCn } from "@/app/source";
import { docsOptionsBase } from "@/app/layout.config";
import { LanguageSwitcher } from "@/app/components/language-switcher";
import { sanitizePageTree } from "@/app/lib/sanitize-page-tree";

const LANG_CN = "docs_cn";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isCn = lang === LANG_CN;
  const rawTree = isCn ? sourceCn.pageTree : source.pageTree;
  const tree = sanitizePageTree(rawTree);

  return (
    <DocsLayout
      {...docsOptionsBase}
      tree={tree}
      links={[
        {
          type: "custom",
          secondary: true,
          children: <LanguageSwitcher />,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
