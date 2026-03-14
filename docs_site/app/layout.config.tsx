import { type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import { source } from "@/app/source";

/** 与语言无关的 layout 配置，tree 由 (home)/[lang]/layout 按 lang 注入 */
export const docsOptionsBase: Omit<DocsLayoutProps, "tree"> = {
  nav: {
    title: "LangGraphJS",
    transparentMode: "top",
  },
  sidebar: {
    defaultOpenLevel: 1,
  },
};

/** 兼容：带英文 tree 的完整配置（用于非 (home) 或 fallback） */
export const docsOptions: DocsLayoutProps = {
  ...docsOptionsBase,
  tree: source.pageTree,
};
