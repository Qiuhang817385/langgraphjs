// source.config.ts
import {
  defineConfig,
  defineDocs
} from "fumadocs-mdx/config";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { rehypeCode } from "fumadocs-core/mdx-plugins";
import {
  transformerNotationDiff,
  transformerNotationHighlight
} from "@shikijs/transformers";
import { remarkMermaid } from "@theguild/remark-mermaid";
var docs = defineDocs({
  dir: "content/docs"
});
var docsCn = defineDocs({
  dir: "content/docs_cn"
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeCode,
        {
          transformers: [
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationHighlight({ matchAlgorithm: "v3" })
          ]
        }
      ]
    ],
    remarkPlugins: [
      remarkMermaid,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }]
    ]
  }
});
export {
  source_config_default as default,
  docs,
  docsCn
};
