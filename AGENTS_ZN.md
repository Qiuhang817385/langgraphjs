# LangGraphJS 开发指南

## 项目概述

LangGraphJS 是 LangGraph 的 JavaScript/TypeScript 实现，LangGraph 是一个用于构建可控 AI Agent 的底层编排框架。它使开发者能够构建具有可定制架构、长期记忆和人机协作能力的有状态、多角色应用程序。

该项目使用 pnpm 工作区和 Turbo 构建编排，采用 monorepo 组织方式。

**仓库地址**: https://github.com/langchain-ai/langgraphjs
**文档地址**: https://langchain-ai.github.io/langgraphjs/
**包注册表**: https://www.npmjs.com/package/@langchain/langgraph

## 技术栈

- **语言**: TypeScript 4.9.5+ 或 5.4.5+
- **运行时**: Node.js 18+（推荐 Node.js 20+）
- **包管理器**: pnpm 10.27.0
- **构建工具**: Turbo 2.5.4 + 自定义构建脚本 (`@langchain/build`)
- **打包工具**: Rolldown/tsdown 用于库构建
- **测试框架**: Vitest 3.2.4（浏览器和 Node 模式），Playwright 用于浏览器测试
- **代码检查**: ESLint with Airbnb 配置 + TypeScript 插件
- **代码格式化**: Prettier
- **版本管理**: Changesets

## 项目结构

```
langgraphjs/
├── libs/                          # 主包
│   ├── langgraph-core/           # 核心库 (@langchain/langgraph) - 主要实现
│   ├── langgraph/                # 旧版包装包（从 core 重新导出）
│   ├── checkpoint/               # 基础检查点接口
│   ├── checkpoint-postgres/      # PostgreSQL 检查点
│   ├── checkpoint-sqlite/        # SQLite 检查点
│   ├── checkpoint-mongodb/       # MongoDB 检查点
│   ├── checkpoint-redis/         # Redis 检查点
│   ├── checkpoint-validation/    # 检查点验证工具
│   ├── sdk/                      # LangGraph API 客户端 SDK (@langchain/langgraph-sdk)
│   ├── sdk-react/                # React 集成
│   ├── sdk-vue/                  # Vue.js 集成
│   ├── sdk-angular/              # Angular 集成
│   ├── sdk-svelte/               # Svelte 集成
│   ├── langgraph-api/            # LangGraph API 服务器实现
│   ├── langgraph-cli/            # CLI 工具 (@langchain/langgraph-cli)
│   ├── langgraph-ui/             # UI 组件
│   ├── langgraph-supervisor/     # Supervisor 模式实现
│   ├── langgraph-swarm/          # Swarm 模式实现
│   ├── langgraph-cua/            # CUA (Computer Use Agent) 实现
│   └── create-langgraph/         # 项目脚手架 CLI
├── examples/                      # 示例应用
│   ├── how-tos/                  # 操作指南
│   ├── ui-react/                 # React UI 示例
│   ├── ui-vue/                   # Vue UI 示例
│   ├── ui-angular/               # Angular UI 示例
│   ├── ui-svelte/                # Svelte UI 示例
│   ├── agent_executor/           # Agent 执行器模式
│   ├── multi_agent/              # 多 Agent 示例
│   └── ...
├── docs/                         # 文档源码
├── internal/                     # 内部工具
│   ├── build/                    # 构建系统 (@langchain/build)
│   ├── bench/                    # 基准测试
│   └── environment_tests/        # 环境/导出测试
└── scripts/                      # 实用脚本
```

## 库架构

核心库 (`@langchain/langgraph`) 按层组织：

### 系统层

1. **Channels 层** (`src/channels/`)
   - 基础通信与状态管理原语
   - 关键类：`BaseChannel`、`LastValue`、`Topic`、`BinaryOperatorAggregate`
   - 位置：`libs/langgraph-core/src/channels/`

2. **Checkpointer 层** (`libs/checkpoint/`)
   - 持久化和状态序列化
   - 支持多种后端（Postgres、SQLite、MongoDB、Redis）
   - 支持时间旅行调试和人机协作

3. **Pregel 层** (`src/pregel/`)
   - 消息传递执行引擎
   - 基于超步的计算模型（受 Google Pregel 启发）
   - 核心执行逻辑在 `src/pregel/index.ts`

4. **Graph 层** (`src/graph/`)
   - 工作流定义的高级 API
   - `Graph`：基础图类
   - `StateGraph`：具有共享状态管理的图
   - 基于注解的状态定义系统

### 层间关键依赖

```
Graph 层 (StateGraph)
    ↓ (基于)
Pregel 层 (执行引擎)
    ↓ (使用)
Channels 层 (状态管理)
    ↓ (可选使用)
Checkpointer 层 (持久化)
```

### 包导出

主包 (`@langchain/langgraph`) 导出多个入口：

- `@langchain/langgraph` - 核心导出
- `@langchain/langgraph/web` - 浏览器优化导出
- `@langchain/langgraph/pregel` - Pregel 执行引擎
- `@langchain/langgraph/channels` - Channel 原语
- `@langchain/langgraph/prebuilt` - 预构建 Agent（createReactAgent 等）
- `@langchain/langgraph/remote` - 远程图客户端
- `@langchain/langgraph/zod` - Zod 模式集成

## 构建和测试命令

所有命令应从仓库根目录 (`langgraphjs/`) 运行：

### 设置
```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 测试
```bash
# 运行所有单元测试
pnpm test

# 运行单个测试文件
pnpm test:single /path/to/test.test.ts

# 运行集成测试（需要 Docker）
pnpm test:int

# 启动集成测试依赖（PostgreSQL）
pnpm test:int:deps

# 停止集成测试依赖
pnpm test:int:deps:down
```

### 代码检查和格式化
```bash
# 检查代码规范
pnpm lint

# 修复代码规范问题
pnpm lint:fix

# 检查格式化
pnpm format:check

# 修复格式化
pnpm format
```

### 发布
```bash
# 创建 changeset
pnpm changeset

# 发布包
pnpm release
```

## 代码风格指南

### TypeScript 配置
- **目标**: ES2021
- **模块系统**: NodeNext
- **严格模式**: 启用
- **声明文件**: 为所有包生成

### 格式化 (Prettier)
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ESLint 规则
- 基础配置：Airbnb + TypeScript 推荐
- **关键规则**：
  - `no-process-env`: 错误（使用显式配置）
  - `no-instanceof/no-instanceof`: 错误（使用适当的类型守卫）
  - `@typescript-eslint/no-floating-promises`: 错误
  - `@typescript-eslint/no-misused-promises`: 错误
  - `import/extensions`: 错误（必须包含文件扩展名）

### 命名约定
- **变量/函数**: camelCase
- **类/类型**: PascalCase
- **常量**: UPPER_CASE
- **文件**: 小写 `.ts`
- **测试**: `.test.ts`（单元），`.int.test.ts`（集成）

### 导入顺序
1. 外部依赖
2. 内部模块（带 `.js` 扩展名）
3. 仅类型导入

示例：
```typescript
import { something } from "external-lib";
import { internalUtil } from "./utils.js";
import type { MyType } from "./types.js";
```

### 错误处理
所有错误必须继承 `BaseLangGraphError`：

```typescript
import { BaseLangGraphError } from "@langchain/langgraph/errors";

export class MyCustomError extends BaseLangGraphError {
  constructor(message?: string, fields?: BaseLangGraphErrorFields) {
    super(message, fields);
    this.name = "MyCustomError";
  }

  static get unminifiable_name() {
    return "MyCustomError";
  }
}
```

故障排除文档的错误代码：
- `GRAPH_RECURSION_LIMIT`
- `INVALID_CONCURRENT_GRAPH_UPDATE`
- `INVALID_GRAPH_NODE_RETURN_VALUE`
- `MISSING_CHECKPOINTER`
- `MULTIPLE_SUBGRAPHS`
- `UNREACHABLE_NODE`

## 测试说明

### 单元测试
- 位置：`src/tests/` 或与源文件并列
- 命名：`*.test.ts`
- 框架：Vitest
- 运行：`pnpm test`（在包目录中）

### 集成测试
- 位置：`src/tests/` 或 `*.int.test.ts`
- 要求：PostgreSQL 测试需要 Docker
- 设置：`pnpm test:int:deps`（启动 PostgreSQL）
- 运行：`pnpm test:int`

### 浏览器测试
- CI 中的独立工作流
- 使用 Playwright
- 框架特定测试在 `sdk-react`、`sdk-vue`、`sdk-angular`、`sdk-svelte`

### 测试环境
集成测试需要环境变量。在 `libs/langgraph/` 中创建 `.env` 文件：
```bash
# 示例来自 libs/langgraph/.env.example
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

## 添加新入口

要添加新的子路径导出（例如 `@langchain/langgraph/tools`）：

1. 创建源文件：`src/tools/index.ts`
2. 在 `package.json` 导出中添加入口点：
```json
{
  "exports": {
    "./tools": {
      "input": "./src/tools/index.ts",
      "import": {
        "types": "./dist/tools/index.d.ts",
        "default": "./dist/tools/index.js"
      }
    }
  }
}
```

## 开发约定

### 新功能
- 匹配现有代码模式
- 确保适当的测试覆盖率
- 首先在 GitHub issues 中讨论主要抽象
- 尽可能保持与 Python LangGraph 的 API 一致性

### Git 工作流
- 使用 "fork and pull request" 工作流
- 不要直接推送到主仓库
- 在 PR 中引用 issues

### 提交信息
- 清晰且描述性强
- 适用时引用 issue 编号

### 文档
- 教程：`docs/docs/tutorials/`
- 操作指南：`docs/docs/how-tos/`
- 概念：`docs/docs/concepts/`
- API 参考：从 TypeScript 生成

## 安全注意事项

- 永远不要提交 API 密钥或凭证
- 使用 `.env` 文件进行本地配置（已在 `.gitignore` 中）
- 集成测试检查环境变量，不存在则跳过
- 不要使用 `instanceof` 检查（由 ESLint 强制执行）以避免跨领域问题

## 部署流程

项目使用 Changesets 进行版本管理：

1. **创建 Changeset**：`pnpm changeset`（选择包，描述变更）
2. **带 Changeset 的 PR**：在 PR 中包含 changeset 文件
3. **发布**：维护者运行 `pnpm release` 进行发布

版本管理遵循 SemVer，但 1.0 之前的版本可能在次要/补丁版本包含破坏性变更。

## 文档结构

LangGraphJS 的文档位于 `docs/` 目录，使用 MkDocs 构建，包含以下主要部分：

```
docs/
├── docs/
│   ├── agents/           # Agent 开发指南
│   ├── concepts/         # 核心概念解释
│   ├── how-tos/          # 操作指南
│   ├── tutorials/        # 教程
│   ├── troubleshooting/  # 故障排除
│   └── versions/         # 版本历史
├── mkdocs.yml           # MkDocs 配置
└── overrides/           # 主题覆盖
```

### 文档内容分类

#### 1. 概念指南 (Concepts)

概念指南提供 LangGraph 框架背后关键概念的解释：

**LangGraph 核心概念**：
- **Why LangGraph?** - LangGraph 的高层次概述和目标
- **LangGraph Glossary** - 图原语的关键概念（State、Nodes、Edges、Channels）
- **Common Agentic Patterns** - 常见的 Agent 架构模式
- **Multi-Agent Systems** - 多 Agent 系统设计模式
- **Persistence** - 持久化层（通过 checkpointers 实现）
- **Memory** - 内存管理（短期和长期记忆）
- **Human-in-the-Loop** - 人机协作交互模式
- **Time Travel** - 时间旅行（回溯和调试）
- **Streaming** - 流式输出支持
- **Breakpoints** - 断点调试
- **Functional API** - 函数式 API 替代方案

**LangGraph Platform 概念**：
- **Deployment Options** - 部署选项（Self-Hosted、Cloud SaaS、BYOC）
- **LangGraph Server** - 服务器架构
- **LangGraph Studio** - 可视化 IDE
- **LangGraph CLI** - 命令行工具
- **Assistants** - 助手配置管理
- **Authentication** - 认证和访问控制

#### 2. 教程 (Tutorials)

教程通过构建各种语言 Agent 和应用程序来介绍 LangGraph：

**入门教程**：
- **Quick Start** - 快速入门
- **Common Workflows** - 常见工作流

**用例实现**：
- **Chatbots** - 聊天机器人（客户支持）
- **RAG** - 检索增强生成（Agentic RAG、Corrective RAG、Self-RAG）
- **Multi-Agent Systems** - 多 Agent 系统（协作、监督、分层团队）
- **Planning Agents** - 规划 Agent（Plan-and-Execute）
- **Reflection & Critique** - 反思与批评

#### 3. 操作指南 (How-to Guides)

操作指南回答 "How do I...?" 类型的问题，是目标导向的具体任务指南：

**LangGraph 核心功能**：
- **Controllability** - 可控性（分支、Map-Reduce、递归限制）
- **Persistence** - 持久化（线程级、跨线程、Postgres）
- **Memory** - 内存管理（对话历史、摘要、语义搜索）
- **Human-in-the-Loop** - 人机协作（等待输入、审查工具调用）
- **Time Travel** - 时间旅行（查看和更新过去状态）
- **Streaming** - 流式输出（状态、Token、自定义数据）
- **Tool Calling** - 工具调用（ToolNode、错误处理）
- **Subgraphs** - 子图（添加、状态管理、转换）
- **Multi-agent** - 多 Agent（网络、多轮对话）
- **State Management** - 状态管理（定义、输入输出模式）

**预构建 ReAct Agent**：
- 创建 ReAct Agent
- 添加记忆
- 添加系统提示
- 人机协作
- 返回结构化输出

**LangGraph Platform**：
- 应用结构设置
- 部署（Cloud、Self-Hosted）
- 认证和访问控制
- 自定义路由和中间件
- Assistant 配置
- Thread 管理
- Streaming
- 前端和生成式 UI
- Cron Jobs
- Webhooks

#### 4. Agent 开发指南 (Agents)

Agent 开发部分专注于使用预构建组件构建基于 Agent 的应用程序：

**核心内容**：
- **Overview** - Agent 开发概述
- **What is an agent?** - Agent 的组成（LLM、Tools、Prompt）
- **Key features** - 关键特性（记忆、人机协作、流式、部署）
- **High-level building blocks** - 高级构建块

**包生态系统**：
| 包 | 描述 | 安装 |
|---|---|---|
| `@langchain/langgraph` | 预构建组件创建 Agent | `npm install @langchain/langgraph @langchain/core` |
| `@langchain/langgraph-supervisor` | Supervisor Agent 工具 | `npm install @langchain/langgraph-supervisor` |
| `@langchain/langgraph-swarm` | Swarm 多 Agent 系统 | `npm install @langchain/langgraph-swarm` |
| `@langchain/mcp-adapters` | MCP 服务器接口 | `npm install @langchain/mcp-adapters` |
| `agentevals` | Agent 性能评估 | `npm install agentevals` |

**主题指南**：
- **Running Agents** - 运行 Agent
- **Memory** - 内存管理
- **Human-in-the-loop** - 人机协作
- **Streaming** - 流式输出
- **Tools** - 工具使用
- **Models** - 模型配置
- **Context** - 上下文管理
- **Multi-agent** - 多 Agent 系统
- **MCP** - Model Context Protocol
- **Deployment** - 部署指南
- **Prebuilt** - 预构建组件
- **Evals** - 评估
- **UI** - 用户界面

#### 5. 故障排除 (Troubleshooting)

错误代码参考：
- `GRAPH_RECURSION_LIMIT` - 图递归限制
- `INVALID_CONCURRENT_GRAPH_UPDATE` - 无效并发图更新
- `INVALID_GRAPH_NODE_RETURN_VALUE` - 无效的图节点返回值
- `MULTIPLE_SUBGRAPHS` - 多个子图
- `UNREACHABLE_NODE` - 不可达节点

## 有用资源

- **CLAUDE.md**：额外的开发指南
- **CONTRIBUTING.md**：详细的贡献指南
- **Pregel 规范**：`libs/langgraph-core/spec/pregel-execution-model.md`
- **架构规范**：`libs/langgraph-core/spec/langgraph-architecture-spec.md`
