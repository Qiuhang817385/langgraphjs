# 部署

要部署您的 LangGraph 智能体，请创建并配置一个 LangGraph 应用。此设置支持本地开发和生产部署。

功能：

* 🖥️ 用于开发的本地服务器
* 🧩 用于可视化调试的 Studio Web UI
* ☁️ 云部署和 🔧 自托管选项
* 📊 用于跟踪和可观测性的 LangSmith 集成

!!! info "要求"

    - ✅ 您**必须**拥有一个 [LangSmith 账户](https://www.langchain.com/langsmith)。您可以**免费**注册并开始使用免费套餐。

## 创建 LangGraph 应用

```bash
npm install -g create-langgraph
create-langgraph path/to/your/app
```

按照提示选择 `New LangGraph Project`。这将创建一个空的 LangGraph 项目。您可以通过将 `src/agent/graph.ts` 中的代码替换为您的智能体代码来修改它。例如：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(
  async (input: { city: string }) => {
    return `It's always sunny in ${input.city}!`;
  },
  {
    name: "getWeather",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    description: "Get weather for a given city.",
  }
);

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
// 确保导出将在 LangGraph API 服务器中使用的图
// highlight-next-line
export const graph = createReactAgent({
  llm,
  tools: [getWeather],
  prompt: "You are a helpful assistant"
})
```

### 安装依赖

在新的 LangGraph 应用根目录中，安装依赖：

```shell
yarn
# 安装这些以使用 Anthropic 的 initChatModel
yarn add langchain
yarn add @langchain/anthropic
```

### 创建 `.env` 文件

您会在新 LangGraph 应用的根目录中找到 `.env.example` 文件。在应用根目录中创建一个 `.env` 文件，并将 `.env.example` 文件的内容复制到其中，填写必要的 API 密钥：

```bash
LANGSMITH_API_KEY=lsv2...
ANTHROPIC_API_KEY=sk-
```

## 在本地启动 LangGraph 服务器

```shell
npx @langchain/langgraph-cli dev
```

这将在本地启动 LangGraph API 服务器。如果成功运行，您将看到类似以下内容：

>    Welcome to LangGraph.js!
> 
>    - 🚀 API: http://localhost:2024
>     
>    - 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024

## LangGraph Studio Web UI

LangGraph Studio Web 是一个专门的 UI，您可以连接到 LangGraph API 服务器，以便在本地实现应用程序的可视化、交互和调试。通过访问 `npx @langchain/langgraph-cli dev` 命令输出中提供的 URL，在 LangGraph Studio Web UI 中测试您的图。

>    - LangGraph Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024

## 部署

一旦您的 LangGraph 应用在本地运行，您可以使用 LangSmith 部署或自托管选项进行部署。有关所有受支持部署模型的详细说明，请参阅 [部署选项指南](https://langchain-ai.github.io/langgraph/tutorials/deployment/)。
