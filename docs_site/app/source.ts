import { docs, docsCn } from "@/.source/server";
import { loader } from "fumadocs-core/source";

// English docs loader
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

// Chinese docs loader
export const sourceCn = loader({
  baseUrl: "/docs_cn",
  source: docsCn.toFumadocsSource(),
});
