import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

const isVercel = Boolean(process.env.VERCEL)

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Vercel 用标准 Next 构建（.next），否则用静态导出到 dist（如本地 preview / GitHub Pages）
  ...(!isVercel && process.env.NODE_ENV === 'production' && { output: 'export' }),
  ...(isVercel ? {} : { distDir: 'dist' }),
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
