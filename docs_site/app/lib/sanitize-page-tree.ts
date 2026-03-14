import type * as PageTree from "fumadocs-core/page-tree";

/**
 * 将任意值规范为可用的 href 字符串，避免 [object Object] 导致 Next Link 报错。
 */
function ensureStringUrl(value: unknown): string {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value)) {
    const parts = value.filter((s): s is string => typeof s === "string");
    return parts.length > 0 ? "/" + parts.join("/") : "#";
  }
  return "#";
}

type TreeLike = Record<string, unknown> & {
  children?: TreeLike[];
  index?: Record<string, unknown> & { url?: unknown };
  url?: unknown;
};

function sanitizeNode(node: TreeLike): TreeLike {
  const out = { ...node };

  if (out.url !== undefined) {
    out.url = ensureStringUrl(out.url);
  }
  if (out.index && typeof out.index === "object" && "url" in out.index) {
    out.index = { ...out.index, url: ensureStringUrl(out.index.url) };
  }
  if (Array.isArray(out.children) && out.children.length > 0) {
    out.children = out.children.map((child) =>
      typeof child === "object" && child !== null ? sanitizeNode(child as TreeLike) : child
    );
  }

  return out;
}

export function sanitizePageTree(root: PageTree.Root): PageTree.Root {
  if (!root || typeof root !== "object") return root;
  const r = root as unknown as TreeLike;
  if (!Array.isArray(r.children)) return root;
  return {
    ...root,
    children: r.children.map((node) =>
      sanitizeNode(node as TreeLike)
    ) as PageTree.Root["children"],
  };
}
