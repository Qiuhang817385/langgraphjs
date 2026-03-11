# 人在回路

要在智能体中审查、编辑和批准工具调用，您可以使用 LangGraph 内置的 [人在回路](../concepts/human_in_the_loop.md) 功能，特别是 [`interrupt()`](/langgraphjs/reference/functions/langgraph.interrupt-1.html) 原语。

LangGraph 允许您**无限期**地暂停执行——持续几分钟、几小时甚至几天——直到收到人工输入。

这是可能的，因为智能体状态被**检查点存入数据库**，这使得系统能够持久化执行上下文，并在之后恢复工作流，从它离开的地方继续。

有关 **human-in-the-loop** 概念的深入了解，请参见 [概念指南](../concepts/human_in_the_loop.md)。

<figure markdown="1">
![image](../concepts/img/human_in_the_loop/tool-call-review.png){: style="max-height:400px"}
<figcaption>
人工可以在继续之前审查和编辑智能体的输出。这在工具调用请求可能敏感或需要人工监督的应用程序中尤为重要。
</figcaption>
</figure>


## 审查工具调用

要为工具添加人工批准步骤：

1. 在工具中使用 `interrupt()` 暂停执行。
2. 使用 `Command({ resume: ... })` 根据人工输入恢复。

```ts
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { interrupt } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// 需要人工审查/批准的敏感工具示例
const bookHotel = tool(
  async (input: { hotelName: string; }) => {
    let hotelName = input.hotelName;
    // highlight-next-line
    const response = interrupt(  // (1)!
      `Trying to call \`book_hotel\` with args {'hotel_name': ${hotelName}}. ` +
      `Please approve or suggest edits.`
    )
    if (response.type === "accept") {
      // 继续执行工具逻辑
    } else if (response.type === "edit") {
        hotelName = response.args["hotel_name"]
    } else {
        throw new Error(`Unknown response type: ${response.type}`)
    }
    return `Successfully booked a stay at ${hotelName}.`;
  },
  {
    name: "bookHotel",
    schema: z.object({
      hotelName: z.string().describe("Hotel to book"),
    }),
    description: "Book a hotel.",
  }
);

// highlight-next-line
const checkpointer = new MemorySaver();  // (2)!

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [bookHotel],
  // highlight-next-line
  checkpointer  // (3)!
});
```

1. [`interrupt` 函数](/langgraphjs/reference/functions/langgraph.interrupt-1.html) 在特定节点暂停智能体图。在本例中，我们在工具函数的开头调用 `interrupt()`，这会在执行工具的节点暂停图。`interrupt()` 内部的信息（例如，工具调用）可以呈现给人，并且可以使用用户输入（工具调用批准、编辑或反馈）恢复图。
2. `InMemorySaver` 用于在工具调用循环的每一步存储智能体状态。这启用了[短期记忆](./memory.md#short-term-memory)和[人在回路](./human-in-the-loop.md)功能。在本示例中，我们使用 `InMemorySaver` 将智能体状态存储在内存中。在生产应用中，智能体状态将存储在数据库中。
3. 使用 `checkpointer` 初始化智能体。

使用 `stream()` 方法运行智能体，传递 `config` 对象以指定线程 ID。这允许智能体在将来的调用中恢复同一会话。

```ts
const config = {
   configurable: {
      // highlight-next-line
      "thread_id": "1"
   }
}

for await (const chunk of await agent.stream(
  { messages: "book a stay at McKittrick hotel" },
  // highlight-next-line
  config
)) {
  console.log(chunk);
  console.log("\n");
};
```

> 您应该看到智能体运行直到到达 `interrupt()` 调用，此时它会暂停并等待人工输入。

使用 `Command({ resume: ... })` 恢复智能体，根据人工输入继续。

```ts
import { Command } from "@langchain/langgraph";

for await (const chunk of await agent.stream(
  new Command({ resume: { type: "accept" } }),  // (1)!
  // new Command({ resume: { type: "edit", args: { "hotel_name": "McKittrick Hotel" } } }),
  // highlight-next-line
  config
)) {
  console.log(chunk);
  console.log("\n");
};
```

1. [`interrupt` 函数](/langgraphjs/reference/functions/langgraph.interrupt-1.html) 与 [`Command`](/langgraphjs/reference/classes/langgraph.Command.html) 对象一起使用，以使用人工提供的值恢复图。

## 其他资源

* [LangGraph 中的人在回路](../concepts/human_in_the_loop.md)
