import {
  defineConfig,
  defineDocs,
} from "fumadocs-mdx/config";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { rehypeCode } from "fumadocs-core/mdx-plugins";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { remarkMermaid } from "@theguild/remark-mermaid";

// Define English docs collection
export const docs = defineDocs({
  dir: "content/docs",
});

// Define Chinese docs collection
export const docsCn = defineDocs({
  dir: "content/docs_cn",
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeCode,
        {
          transformers: [
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
          ],
        },
      ],
    ],
    remarkPlugins: [
      remarkMermaid,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }],
    ],
  },
});
