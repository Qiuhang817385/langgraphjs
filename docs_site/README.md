# LangGraphJS Documentation Site

基于 [Fumadocs](https://fumadocs.vercel.app) + Next.js 的现代化文档站点，支持中英文双语。

## 项目结构

```
docs_site/
├── app/                          # Next.js App Router
│   ├── (home)/                   # 文档首页路由组
│   │   ├── [[...slug]]/          # 动态路由 - 匹配所有文档页面
│   │   │   └── page.tsx          # 文档页面渲染
│   │   └── layout.tsx            # 首页布局
│   ├── api/                      # API 路由
│   │   └── search/               # 搜索 API
│   │       └── route.ts          # 搜索接口
│   ├── global.css                # 全局样式
│   ├── layout.tsx                # 根布局
│   ├── layout.config.tsx         # Fumadocs 布局配置
│   ├── source.ts                 # 文档源配置
│   └── middleware.ts             # 路由中间件（国际化等）
├── components/                   # React 组件
│   ├── layout/                   # 布局组件
│   ├── ui/                       # 基础 UI 组件
│   └── react/                    # 业务组件
├── content/                      # 文档内容（MDX 文件）
│   ├── docs/                     # 英文文档
│   │   ├── meta.json             # 导航配置
│   │   ├── index.mdx             # 首页
│   │   ├── concepts/             # 概念指南
│   │   ├── tutorials/            # 教程
│   │   ├── how-tos/              # 操作指南
│   │   ├── agents/               # 代理相关
│   │   ├── troubleshooting/      # 故障排除
│   │   └── versions/             # 版本信息
│   └── docs_cn/                  # 中文文档
│       └── ...                   # 与英文文档相同结构
├── lib/                          # 工具库
│   ├── hooks/                    # React Hooks
│   ├── icons/                    # 图标配置
│   ├── providers/                # Context Providers
│   └── utils.ts                  # 工具函数
├── public/                       # 静态资源
│   ├── images/
│   └── fonts/
├── scripts/                      # 构建脚本
│   └── copy-docs.mjs             # 文档复制转换脚本
├── next.config.mjs               # Next.js 配置
├── source.config.ts              # Fumadocs 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖
```

## 技术栈

| 层级 | 技术选型 | 用途 |
|------|----------|------|
| **框架** | Next.js 16.x | React 全栈框架 |
| **语言** | TypeScript 5.x | 类型安全 |
| **文档引擎** | Fumadocs 16.x | 基于 Next.js 的文档框架 |
| **样式** | Tailwind CSS 4.x | 原子化 CSS |
| **UI 组件** | Radix UI + Fumadocs UI | Headless UI 组件库 |
| **代码高亮** | Shiki 3.x | 语法高亮 |
| **图表** | Mermaid | 流程图和图表 |

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
cd docs_site
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000/docs 查看英文文档
访问 http://localhost:3000/docs_cn 查看中文文档

### 构建

```bash
pnpm build
```

构建输出将生成在 `dist` 目录。

## 文档内容

### 内容来源

文档内容源自从原始 `docs` 和 `docs_cn` 目录复制并转换的内容：

- `content/docs/` - 英文文档（从 `docs/docs` 复制转换）
- `content/docs_cn/` - 中文文档（从 `docs_cn/docs` 复制转换）

### 重新同步文档

如果需要从原始目录重新同步文档内容，运行：

```bash
node scripts/copy-docs.mjs
```

### 内容组织

文档使用 `meta.json` 文件进行导航配置。每个目录可以包含一个 `meta.json` 文件来定义：

- 标题
- 描述
- 页面顺序
- 分隔符

示例：

```json
{
  "title": "Concepts",
  "description": "Conceptual guides",
  "pages": [
    "index",
    "---Category---",
    "page1",
    "page2"
  ]
}
```

## 多语言支持

站点支持中英文双语：

- 英文文档路径：`/docs/*`
- 中文文档路径：`/docs_cn/*`

语言切换可通过顶部导航栏进行。

## 特性

- ✅ 基于 MDX 的文档编写
- ✅ 自动生成的导航和搜索
- ✅ 代码语法高亮（Shiki）
- ✅ Mermaid 图表支持
- ✅ 响应式设计
- ✅ 深色/浅色主题切换
- ✅ 中英文双语支持
- ✅ 静态导出支持

## 部署

### 静态导出

项目配置为静态导出模式，可以部署到任何静态托管服务：

```bash
pnpm build
# 输出在 dist/ 目录
```

### Vercel 部署

```bash
vercel --prod
```

## 参考资源

- [Fumadocs 文档](https://fumadocs.vercel.app)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [原始文档架构指南](../docs-architecture-guide.md)

## License

MIT - 与 LangGraphJS 项目相同
