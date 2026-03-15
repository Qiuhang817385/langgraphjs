import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 仅生产构建时静态导出，开发时关闭以避免 generateStaticParams 在 dev 下报错
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  distDir: 'dist',
  // 部署到 Vercel、base path 为 / 时无需 assetPrefix
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs_cn',
        permanent: false,
      },
    ]
  },
}

export default withMDX(config)
