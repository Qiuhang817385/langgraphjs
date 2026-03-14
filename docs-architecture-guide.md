# 文档站点架构指南

> 基于 Fumadocs + Next.js 的现代化文档站点模板
> 
> 本文档可作为新建文档项目的参考模板，只需替换内容目录即可快速启动

---

## 📋 目录

1. [快速开始](#快速开始)
2. [核心技术栈](#核心技术栈)
3. [主要依赖](#主要依赖)
4. [目录结构](#目录结构)
5. [内容架构](#内容架构)
6. [国际化架构](#国际化架构)
7. [路由配置](#路由配置)
8. [MDX 处理流程](#mdx-处理流程)
9. [主题与样式系统](#主题与样式系统)
10. [分析与监控集成](#分析与监控集成)
11. [部署流程](#部署流程)
12. [关键脚本](#关键脚本)

---

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 初始化项目

```bash
# 克隆模板或创建新项目
npx create-fumadocs-app@latest my-docs
cd my-docs

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

---

## 核心技术栈

| 层级 | 技术选型 | 用途 |
|------|----------|------|
| **框架** | Next.js 16.x | React 全栈框架 |
| **语言** | TypeScript 5.x | 类型安全 |
| **文档引擎** | Fumadocs | 基于 Next.js 的文档框架 |
| **样式** | Tailwind CSS 4.x | 原子化 CSS |
| **UI 组件** | Radix UI + Fumadocs UI | Headless UI 组件库 |
| **构建** | Webpack | 打包工具 |
| **包管理** | pnpm | 依赖管理 |

---

## 主要依赖

### 核心文档框架

```json
{
  "fumadocs-core": "^16.0.0",      // 文档核心功能
  "fumadocs-ui": "^16.0.0",        // 文档 UI 组件
  "fumadocs-mdx": "^14.2.4",       // MDX 支持
  "fumadocs-docgen": "^1.2.0",     // 文档生成
  "fumadocs-typescript": "^5.0.0"  // TypeScript 文档生成
}
```

### UI 与样式

```json
{
  "tailwindcss": "^4.1.x",
  "@radix-ui/react-dialog": "^1.1.x",
  "@radix-ui/react-select": "^2.1.x",
  "lucide-react": "^0.4x.x",       // 图标库
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.1.x",
  "tailwind-merge": "^2.5.x"
}
```

### 代码高亮与图表

```json
{
  "shiki": "^3.x",                          // 语法高亮
  "@shikijs/transformers": "^3.x",          // 代码转换器
  "@theguild/remark-mermaid": "^0.3.x",     // Mermaid 图表
  "rehype-highlight-code-lines": "^1.x"     // 代码行高亮
}
```

### 分析与监控（可选）

```json
{
  "posthog-js": "^1.x",      // 产品分析
  "react-ga4": "^2.x"        // Google Analytics 4
}
```

---

## 目录结构

```
my-docs/
├── app/                          # Next.js App Router
│   ├── (home)/                   # 文档首页路由组
│   │   ├── [[...slug]]/          # 动态路由 - 匹配所有文档页面
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API 路由
│   │   └── search/               # 搜索 API
│   │       └── route.ts
│   ├── global.css                # 全局样式
│   ├── layout.tsx                # 根布局
│   ├── layout.config.tsx         # Fumadocs 布局配置
│   ├── source.ts                 # 文档源配置
│   └── middleware.ts             # 路由中间件（国际化等）
├── components/                   # React 组件
│   ├── layout/                   # 布局组件
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── banners.tsx
│   ├── ui/                       # 基础 UI 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── search-dialog.tsx
│   └── react/                    # 业务组件
│       └── custom-components.tsx
├── content/                      # 文档内容（MDX 文件）
│   └── docs/                     # 主文档目录
│       ├── meta.json             # 导航配置
│       ├── index.mdx             # 首页
│       ├── getting-started/      # 分类目录
│       │   ├── meta.json
│       │   ├── installation.mdx
│       │   └── quickstart.mdx
│       └── guides/               # 其他分类
│           └── meta.json
├── lib/                          # 工具库
│   ├── hooks/                    # React Hooks
│   ├── icons/                    # 图标配置
│   ├── providers/                # Context Providers
│   └── utils.ts                  # 工具函数
├── public/                       # 静态资源
│   ├── images/
│   └── fonts/
├── scripts/                      # 构建脚本
│   └── generate-content.mjs
├── next.config.mjs               # Next.js 配置
├── source.config.ts              # Fumadocs 配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind 配置
└── package.json
```

---

## 内容架构

### 推荐的内容组织方式

```
content/docs/
├── meta.json                     # 根导航配置
├── index.mdx                     # 文档首页
│
├── getting-started/              # 入门指南
│   ├── meta.json
│   ├── installation.mdx
│   ├── quickstart.mdx
│   └── configuration.mdx
│
├── guides/                       # 使用指南
│   ├── meta.json
│   ├── basic-usage.mdx
│   └── advanced-features.mdx
│
├── api-reference/                # API 文档（可选）
│   ├── meta.json
│   └── components/
│       ├── meta.json
│       └── button.mdx
│
└── (other)/                      # 其他页面
    └── changelog.mdx
```

### meta.json 配置示例

```json
{
  "title": "文档标题",
  "description": "文档描述",
  "pages": [
    "index",
    "---入门---",
    "getting-started",
    "---指南---",
    "guides",
    "..."
  ]
}
```

### MDX 文件 Frontmatter

```yaml
---
title: 页面标题
description: 页面描述
---

# 内容正文
```

---

## 国际化架构

### 多语言支持方案

```
content/
├── docs/                         # 默认语言（英文）
│   ├── meta.json
│   └── ...
└── docs_cn/                      # 中文版本
    ├── meta.json
    └── ...
```

### 路由中间件配置

```typescript
// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 处理中文路由 /_cn/* → /(root)_cn/*
  if (pathname.startsWith("/_cn/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/_cn/", "/(root)_cn/");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/_cn", "/_cn/:path*"],
};
```

---

## 路由配置

### Next.js 配置示例

```javascript
// next.config.mjs
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  
  // 静态导出配置
  output: "export",
  distDir: "dist",
  
  // 图片优化（静态导出时需禁用）
  images: {
    unoptimized: true,
  },
  
  // URL 重写规则
  async rewrites() {
    return {
      beforeFiles: [
        // 示例：/api/* 重写
        {
          source: "/old-path/:path*",
          destination: "/new-path/:path*",
        },
      ],
    };
  },
  
  // 重定向规则
  async redirects() {
    return [
      {
        source: "/legacy-path",
        destination: "/new-path",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
```

---

## MDX 处理流程

### Fumadocs 配置

```typescript
// source.config.ts
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";
import { fileGenerator, remarkDocGen, remarkInstall } from "fumadocs-docgen";
import { rehypeCode } from "fumadocs-core/mdx-plugins";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { remarkMermaid } from "@theguild/remark-mermaid";

// 扩展 Frontmatter Schema
const extendedFrontmatterSchema = frontmatterSchema.extend({
  hideHeader: z.boolean().optional(),
  hideTOC: z.boolean().optional(),
});

// 定义文档集合
export const docs = defineDocs({
  docs: {
    schema: extendedFrontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // Rehype 插件（处理 HTML）
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
    // Remark 插件（处理 Markdown）
    remarkPlugins: [
      remarkMermaid,                                    // Mermaid 图表
      [remarkInstall, { persist: { id: "package-manager" } }],  // 包管理器切换
      [remarkDocGen, { generators: [fileGenerator()] }],        // 自动生成文档
    ],
  },
});
```

### 文档源配置

```typescript
// app/source.ts
import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";
import { icon } from "@/lib/icons";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  icon,
});
```

---

## 主题与样式系统

### 全局样式配置

```css
/* app/global.css */
@import 'tailwindcss';
@import 'fumadocs-ui/css/shadcn.css';
@import 'fumadocs-ui/css/preset.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-spline: var(--font-spline-sans-mono);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}
```

### 主题变量定义

```css
/* 浅色主题 */
:root {
  --radius: 0.65rem;
  --background: oklch(0.9038 0.0149 286.1);
  --foreground: oklch(0.1081 0.0147 220.92);
  --primary: oklch(0.55 0.25 285);
  --primary-foreground: oklch(0.98 0.005 285);
  --secondary: oklch(0.967 0.001 286.375);
  --muted: oklch(0.967 0.001 286.375);
  --border: oklch(0.9 0 0);
  --sidebar: #EFEFF3;
  /* ... */
}

/* 深色主题 */
.dark {
  --background: oklch(0.1081 0.0147 220.92);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.65 0.15 285);
  --sidebar: #111618;
  /* ... */
}
```

### 布局组件配置

```typescript
// app/layout.config.tsx
import { type HomeLayoutProps } from "fumadocs-ui/home-layout";
import { type DocsLayoutProps } from "fumadocs-ui/docs-layout";
import { source } from "@/app/source";

// 首页布局配置
export const homeOptions: HomeLayoutProps = {
  nav: {
    title: "My Docs",
  },
  links: [
    {
      text: "文档",
      url: "/docs",
      active: "nested-url",
    },
  ],
};

// 文档布局配置
export const docsOptions: DocsLayoutProps = {
  tree: source.pageTree,
  nav: {
    title: "My Docs",
    transparentMode: "top",
  },
};
```

---

## 分析与监控集成

### 分析 Provider 包装器

```typescript
// lib/providers/providers-wrapper.tsx
"use client";

import React, { Suspense } from "react";
import { PostHogProvider } from "./posthog-provider";
import { useGoogleAnalytics } from "@/lib/hooks/use-google-analytics";

export function ProvidersWrapper({ children }: { children: React.React.ReactNode }) {
  useGoogleAnalytics();

  return (
    <Suspense fallback={null}>
      <PostHogProvider>{children}</PostHogProvider>
    </Suspense>
  );
}
```

### 根布局集成

```typescript
// app/layout.tsx
import { RootProvider } from "fumadocs-ui/provider/next";
import { ProvidersWrapper } from "@/lib/providers/providers-wrapper";
import SearchDialog from "@/components/ui/search-dialog";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 第三方脚本（HubSpot、分析工具等） */}
        <Script
          id="analytics-script"
          src="https://analytics.example.com/script.js"
          async
          defer
        />
      </head>
      <body>
        <ProvidersWrapper>
          <RootProvider
            theme={{ enabled: true, defaultTheme: "system" }}
            search={{ SearchDialog: SearchDialog }}
          >
            {children}
          </RootProvider>
        </ProvidersWrapper>
      </body>
    </html>
  );
}
```

---

## 部署流程

### 构建流程图

```
┌─────────────────┐
│   MDX Content   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    generate     │  (可选：生成动态内容)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  check-links    │  (可选：检查死链)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   next build    │  (静态生成)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to CDN  │  (Vercel/Netlify/等)
└─────────────────┘
```

### 部署配置

#### Vercel 部署

```yaml
# .github/workflows/deploy.yml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 静态导出部署

```javascript
// next.config.mjs
const config = {
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
};
```

---

## 关键脚本

### package.json 脚本

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "postinstall": "fumadocs-mdx",
    "prepare": "husky",
    "check-links": "node scripts/check-broken-links.js",
    "generate": "node scripts/generate-content.mjs",
    "predev": "npm run generate",
    "prebuild": "npm run generate && npm run check-links"
  }
}
```

### 脚本说明

| 脚本 | 说明 |
|------|------|
| `dev` | 启动开发服务器 |
| `build` | 构建生产版本 |
| `postinstall` | 安装后执行 Fumadocs MDX 初始化 |
| `generate` | 生成动态内容（可选） |
| `check-links` | 检查文档中的死链（可选） |
| `prebuild` | 构建前自动执行生成和链接检查 |

---

## 附录：内容架构参考

### 推荐的分类结构

以下是一个通用的文档分类参考，可根据实际项目调整：

```
docs/
├── index.mdx                     # 首页/介绍
├── getting-started/              # 入门
│   ├── installation.mdx          # 安装
│   ├── quickstart.mdx            # 快速开始
│   └── configuration.mdx         # 配置
├── guides/                       # 指南
│   ├── basic-usage.mdx
│   ├── advanced-features.mdx
│   └── best-practices.mdx
├── api-reference/                # API 文档
│   └── components/
├── examples/                     # 示例
│   └── basic-example.mdx
├── contribute/                   # 贡献指南
│   └── contributing.mdx
└── troubleshooting/              # 故障排除
    └── faq.mdx
```

### 文件命名规范

- 使用小写字母和连字符：`getting-started.mdx`
- 避免空格和特殊字符
- 使用英文文件名（即使内容是中文）

---

## 参考资源

- [Fumadocs 文档](https://fumadocs.vercel.app)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 文档](https://www.radix-ui.com)

---

*本文档模板基于 CopilotKit 文档站点的架构实践整理而成*
