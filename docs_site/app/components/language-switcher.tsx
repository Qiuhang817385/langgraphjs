"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOCS_EN = "/docs";
const DOCS_CN = "/docs_cn";

/**
 * 根据当前路径返回另一语言的同路径
 * /docs/agents/agents -> /docs_cn/agents/agents
 * /docs_cn/concepts -> /docs/concepts
 */
function getAlternatePath(pathname: string): { href: string; label: string } {
  if (pathname.startsWith(DOCS_CN)) {
    const rest = pathname.slice(DOCS_CN.length) || "/";
    return { href: `${DOCS_EN}${rest}`, label: "English" };
  }
  const rest = pathname.startsWith(DOCS_EN) ? pathname.slice(DOCS_EN.length) || "/" : "/";
  return { href: `${DOCS_CN}${rest}`, label: "中文" };
}

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const { href, label } = getAlternatePath(pathname);

  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-label={label === "中文" ? "Switch to Chinese" : "Switch to English"}
    >
      {label}
    </Link>
  );
}
