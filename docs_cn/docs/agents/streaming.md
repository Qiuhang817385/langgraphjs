# 流式传输

流式传输是构建响应式应用程序的关键。有几种类型的数据您可能想要流式传输：

1. [**智能体进度**](#agent-progress) —— 在智能体图中的每个节点执行后获取更新。
2. [**LLM token**](#llm-tokens) —— 在语言模型生成 token 时流式传输它们。
3. [**自定义更新**](#tool-updates) —— 在执行期间从工具发出自定义数据（例如，"已获取 10/100 条记录"）

您可以同时流式传输[多种类型的数据](#stream-multiple-modes)。


<figure markdown="1">
![image](./assets/fast_parrot.png){: style="max-height:300px"}
<figcaption>
等待是给鸽子准备的。
</figcaption>
</figure>

## 智能体进度

要流式传输智能体进度，请使用带有 `streamMode: "updates"` 的 [`stream()`](/langgraphjs/reference/classes/langgraph.CompiledStateGraph.html#stream) 方法。这在每个智能体步骤后发出一个事件。

例如，如果您有一个调用一次工具的智能体，您应该会看到以下更新：

* **LLM 节点**：带有工具调用请求的 AI 消息
* **工具节点**：带有执行结果的工具消息
* **LLM 节点**：最终 AI 响应

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getWeather],
});
// highlight-next-line
for await (const chunk of await agent.stream(
  { messages: "what is the weather in sf" },
  // highlight-next-line
  { streamMode: "updates" }
)) {
  console.log(chunk);
  console.log("\n");
}
```

## LLM token

要在 LLM 生成 token 时流式传输它们，请使用 `streamMode: "messages"`：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getWeather],
});
// highlight-next-line
for await (const [token, metadata] of await agent.stream(
  { messages: "what is the weather in sf" },
  // highlight-next-line
  { streamMode: "messages" }
)) {
  console.log("Token", token);
  console.log("Metadata", metadata);
  console.log("\n");
}
```

## 工具更新

要在工具执行期间流式传输工具的更新，您可以使用通过 `config.writer` 可用的 `writer` 对象：

```ts
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

const getWeather = tool(
  async (input: { city: string }, config: LangGraphRunnableConfig) => {
    // 流式传输任意数据
    // highlight-next-line
    config.writer?.(`Looking up data for city: ${input.city}`);
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
const agent = createReactAgent({
  llm,
  tools: [getWeather],
});

for await (const chunk of await agent.stream(
  { messages: "what is the weather in sf" },
  // highlight-next-line
  { streamMode: "custom" }
)) {
  console.log(chunk);
  console.log("\n");
}
```

## 流式传输多种模式

您可以通过将流式模式作为列表传递来指定多种流式模式：`streamMode: ["updates", "messages", "custom"]`：

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getWeather],
});

for await (const [streamMode, chunk] of await agent.stream(
  { messages: "what is the weather in sf" },
  // highlight-next-line
  { streamMode: ["updates", "messages", "custom"] }
)) {
  console.log(streamMode, chunk);
  console.log("\n");
}
```

## 其他资源

* [LangGraph 中的流式传输](https://langchain-ai.github.io/langgraphjs/how-tos/#streaming)
