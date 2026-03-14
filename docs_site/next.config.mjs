import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 仅生产构建时静态导出，开发时关闭以避免 generateStaticParams 在 dev 下报错
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  distDir: "dist",
  // 静态导出时用 "." 支持子路径部署；dev 时必须 "/" 或绝对 URL，否则 next/font 报错
  assetPrefix: process.env.NODE_ENV === "production" ? "." : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/docs_cn",
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);
