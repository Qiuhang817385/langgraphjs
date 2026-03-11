# LangGraph 快速入门

本指南将向您展示如何设置和使用 LangGraph 的**预构建**、**可复用**组件，这些组件旨在帮助您快速、可靠地构建智能体系统。

## 前提条件

在开始本教程之前，请确保您具备以下条件：

- 一个 [Anthropic](https://console.anthropic.com/settings/keys) API 密钥

## 1. 安装依赖

如果您尚未安装，请安装 LangGraph 和 LangChain：

```
npm install langchain @langchain/langgraph @langchain/anthropic
```

## 2. 创建智能体

使用 [`createReactAgent`](/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html) 来实例化一个智能体：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool( // (1)!
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

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest"); // (2)!
const agent = createReactAgent({
  llm,
  tools: [getWeather], // (3)!
  prompt: "You are a helpful assistant", // (4)!
});

// Run the agent
await agent.invoke({
  messages: [{ role: "user", content: "what is the weather in sf" }],
});
```

1. 定义智能体可以使用的工具。有关更高级的工具使用和自定义，请查看 [tools](./tools.md) 页面。
2. 为智能体提供语言模型。要了解有关为智能体配置语言模型的更多信息，请查看 [models](./models.md) 页面。
3. 为模型提供可用工具列表。
4. 为智能体使用的语言模型提供系统提示词（指令）。

## 3. 配置 LLM

使用 [`initChatModel`](https://api.js.langchain.com/functions/langchain.chat_models_universal.initChatModel.html) 配置具有特定参数（如 temperature）的 LLM：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

// highlight-next-line
const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest", {
  // highlight-next-line
  temperature: 0,
});

const agent = createReactAgent({
  // highlight-next-line
  llm,
  tools: [getWeather],
});
```

有关如何配置 LLM 的更多信息，请参见 [models](./models.md) 页面。

## 4. 添加自定义提示词

提示词用于指导 LLM 的行为。它们可以是：

- **静态**：字符串被解释为**系统消息**
- **动态**：基于输入或配置在**运行时**生成的消息列表

=== "静态提示词"

    定义固定的提示词字符串或消息列表。

    ```ts
    import { createReactAgent } from "@langchain/langgraph/prebuilt";
    import { initChatModel } from "langchain/chat_models/universal";

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getWeather],
      // 永不改变的静态提示词
      // highlight-next-line
      prompt: "Never answer questions about the weather.",
    });

    await agent.invoke({
      messages: "what is the weather in sf",
    });
    ```

=== "动态提示词"

    定义一个基于智能体状态和配置返回消息列表的函数：

    ```ts
    import { BaseMessageLike } from "@langchain/core/messages";
    import { RunnableConfig } from "@langchain/core/runnables";
    import { initChatModel } from "langchain/chat_models/universal";
    import { MessagesAnnotation } from "@langchain/langgraph";
    import { createReactAgent } from "@langchain/langgraph/prebuilt";

    const prompt = (
      state: typeof MessagesAnnotation.State,
      config: RunnableConfig
    ): BaseMessageLike[] => { // (1)!
      const userName = config.configurable?.userName;
      const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;
      return [{ role: "system", content: systemMsg }, ...state.messages];
    };

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getWeather],
      // highlight-next-line
      prompt,
    });

    await agent.invoke(
      { messages: [{ role: "user", content: "what is the weather in sf" }] },
      // highlight-next-line
      { configurable: { userName: "John Smith" } }
    );
    ```

    1. 动态提示词允许在构建 LLM 输入时包含非消息类型的[上下文](./context.md)，例如：

      - 运行时传入的信息，如 `userId` 或 API 凭证（使用 `config`）。
      - 在多步推理过程中更新的内部智能体状态（使用 `state`）。

      动态提示词可以定义为接受 `state` 和 `config` 并返回要发送给 LLM 的消息列表的函数。

更多信息，请参见 [Context](./context.md)。

## 5. 添加记忆

要允许与智能体进行多轮对话，您需要通过在创建智能体时提供 `checkpointer` 来启用[持久化](../concepts/persistence.md)。在运行时，您需要提供包含 `thread_id` 的配置——这是一个会话的唯一标识符：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { initChatModel } from "langchain/chat_models/universal";

// highlight-next-line
const checkpointer = new MemorySaver();

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getWeather],
  // highlight-next-line
  checkpointer, // (1)!
});

// Run the agent
// highlight-next-line
const config = { configurable: { thread_id: "1" } };
const sfResponse = await agent.invoke(
  { messages: [{ role: "user", content: "what is the weather in sf" }] },
  config // (2)!
);
const nyResponse = await agent.invoke(
  { messages: [{ role: "user", content: "what about new york?" }] },
  config
);
```

1. `checkpointer` 允许智能体在工具调用循环的每一步都存储其状态。这启用了[短期记忆](./memory.md#short-term-memory)和[人在回路](./human-in-the-loop.md)功能。
2. 传递包含 `thread_id` 的配置，以便在将来的智能体调用中恢复同一会话。

当您启用 checkpointer 时，它会在提供的 checkpointer 数据库（如果使用 `InMemorySaver`，则在内存中）的每一步都存储智能体状态。

请注意，在上面的示例中，当使用相同的 `thread_id` 第二次调用智能体时，第一次对话的原始消息历史会自动包含，与新用户输入一起。

更多信息，请参见 [Memory](./memory.md)。

## 6. 配置结构化输出

要生成符合模式的结构化响应，请使用 `responseFormat` 参数。可以使用 `zod` 模式定义结构。结果可通过 `structuredResponse` 字段访问。

```ts
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

const WeatherResponse = z.object({
  conditions: z.string(),
});

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getWeather],
  // highlight-next-line
  responseFormat: WeatherResponse, // (1)!
});

const response = await agent.invoke({
  messages: [{ role: "user", content: "what is the weather in sf" }],
});
// highlight-next-line
response.structuredResponse;
```

1. 当提供 `responseFormat` 时，在智能体循环的末尾会添加一个单独的步骤：智能体消息历史被传递给具有结构化输出的 LLM 以生成结构化响应。

   要为这个 LLM 提供系统提示词，请使用对象 `{ prompt, schema }`，例如 `responseFormat: { prompt, schema: WeatherResponse }`。

!!! 注意 "LLM 后处理"

    结构化输出需要额外调用 LLM 以根据模式格式化响应。

## 下一步

- [在本地部署您的智能体](../tutorials/langgraph-platform/local-server.md)
- [了解更多关于预构建智能体的信息](../agents/overview.md)
- [LangGraph Platform 快速入门](../cloud/quick_start.md)
