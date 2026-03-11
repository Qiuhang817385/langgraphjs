# 上下文

智能体通常需要超出消息列表的内容才能有效运作。它们需要**上下文**。

上下文包括消息列表之外任何可以影响智能体行为或工具执行的数据。这可以是：

- 运行时传入的信息，如 `user_id` 或 API 凭证。
- 在多步推理过程中更新的内部状态。
- 来自之前交互的持久记忆或事实。

LangGraph 提供**三种**主要方式来提供上下文：

| 类型                                                                         | 描述                                   | 可变？ | 生命周期                |
|------------------------------------------------------------------------------|----------------------------------------|--------|-------------------------|
| [**配置**](#config-static-context)                                           | 运行开始时传递的数据                   | ❌     | 每次运行                |
| [**状态**](#state-mutable-context)                                           | 执行过程中可以改变的动态数据           | ✅     | 每次运行或会话          |
| [**长期记忆（存储）**](#long-term-memory-cross-conversation-context)         | 可以跨会话共享的数据                   | ✅     | 跨会话                  |

您可以使用上下文来：

- 调整模型看到的系统提示词
- 为工具提供必要的输入
- 跟踪正在进行的对话中的事实

## 提供运行时上下文

当您需要在运行时将数据注入智能体时使用此功能。

### 配置（静态上下文）

配置用于用户元数据或 API 密钥等不可变数据。在值在运行期间不会更改时使用。

使用名为 **"configurable"** 的键来指定配置，该键专用于此目的：

```ts
await agent.invoke(
  { messages: "hi!" },
  // highlight-next-line
  { configurable: { userId: "user_123" } }
)
```

### 状态（可变上下文）

状态在运行期间充当短期记忆。它保存可以在执行过程中演变的动态数据，例如从工具或 LLM 输出中派生的值。

```ts
const CustomState = Annotation.Root({
  ...MessagesAnnotation.spec,
  userName: Annotation<string>,
});

const agent = createReactAgent({
  // Other agent parameters...
  // highlight-next-line
  stateSchema: CustomState,
})

await agent.invoke(
  // highlight-next-line
  { messages: "hi!", userName: "Jane" }
)
```

!!! tip "开启记忆"

    有关如何启用记忆的更多详细信息，请参见 [memory guide](./memory.md)。这是一个强大的功能，允许您在多次调用之间持久化智能体的状态。
    否则，状态仅作用于单次智能体运行。



### 长期记忆（跨会话上下文）

对于跨会话或会话的上下文，LangGraph 允许通过 `store` 访问**长期记忆**。这可用于读取或更新持久化事实（例如，用户配置文件、偏好设置、先前的交互）。更多信息，请参见 [Memory guide](./memory.md)。

## 使用上下文自定义提示词

提示词定义智能体的行为方式。要整合运行时上下文，您可以基于智能体的状态或配置动态生成提示词。

常见用例：

- 个性化
- 角色或目标自定义
- 条件行为（例如，用户是管理员）

=== "使用配置"

    ```ts
    import { BaseMessageLike } from "@langchain/core/messages";
    import { RunnableConfig } from "@langchain/core/runnables";
    import { initChatModel } from "langchain/chat_models/universal";
    import { MessagesAnnotation } from "@langchain/langgraph";
    import { createReactAgent } from "@langchain/langgraph/prebuilt";

    const prompt = (
      state: typeof MessagesAnnotation.State,
      // highlight-next-line
      config: RunnableConfig
    ): BaseMessageLike[] => {
      // highlight-next-line
      const userName = config.configurable?.userName;
      const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;
      return [{ role: "system", content: systemMsg }, ...state.messages];
    };

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getWeather],
      // highlight-next-line
      prompt
    });

    await agent.invoke(
      { messages: "hi!" },
      // highlight-next-line
      { configurable: { userName: "John Smith" } }
    );
    ```

=== "使用状态"

    ```ts
    import { BaseMessageLike } from "@langchain/core/messages";
    import { RunnableConfig } from "@langchain/core/runnables";
    import { initChatModel } from "langchain/chat_models/universal";
    import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
    import { createReactAgent } from "@langchain/langgraph/prebuilt";

    const CustomState = Annotation.Root({
      ...MessagesAnnotation.spec,
      // highlight-next-line
      userName: Annotation<string>,
    });

    const prompt = (
      // highlight-next-line
      state: typeof CustomState.State,
    ): BaseMessageLike[] => {
      // highlight-next-line
      const userName = state.userName;
      const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;
      return [{ role: "system", content: systemMsg }, ...state.messages];
    };

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getWeather],
      // highlight-next-line
      prompt,
      // highlight-next-line
      stateSchema: CustomState,
    });

    await agent.invoke(
      // highlight-next-line
      { messages: "hi!", userName: "John Smith" },
    );
    ```

## 工具

工具可以通过以下方式访问上下文：

* 使用 `RunnableConfig` 访问配置
* 使用 `getCurrentTaskInput()` 访问智能体状态

=== "使用配置"

    ```ts
    import { RunnableConfig } from "@langchain/core/runnables";
    import { initChatModel } from "langchain/chat_models/universal";
    import { createReactAgent } from "@langchain/langgraph/prebuilt";
    import { tool } from "@langchain/core/tools";
    import { z } from "zod";

    const getUserInfo = tool(
      async (input: Record<string, any>, config: RunnableConfig) => {
        // highlight-next-line
        const userId = config.configurable?.userId;
        return userId === "user_123" ? "User is John Smith" : "Unknown user";
      },
      {
        name: "get_user_info",
        description: "Look up user info.",
        schema: z.object({}),
      }
    );

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getUserInfo],
    });

    await agent.invoke(
      { messages: "look up user information" },
      // highlight-next-line
      { configurable: { userId: "user_123" } }
    );
    ```

=== "使用状态"

    ```ts
    import { initChatModel } from "langchain/chat_models/universal";
    import { createReactAgent } from "@langchain/langgraph/prebuilt";
    import { Annotation, MessagesAnnotation, getCurrentTaskInput } from "@langchain/langgraph";
    import { tool } from "@langchain/core/tools";
    import { z } from "zod";

    const CustomState = Annotation.Root({
      ...MessagesAnnotation.spec,
      // highlight-next-line
      userId: Annotation<string>(),
    });

    const getUserInfo = tool(
      async (
        input: Record<string, any>,
      ) => {
        // highlight-next-line
        const state = getCurrentTaskInput() as typeof CustomState.State;
        // highlight-next-line
        const userId = state.userId;
        return userId === "user_123" ? "User is John Smith" : "Unknown user";
      },
      {
        name: "get_user_info",
        description: "Look up user info.",
        schema: z.object({})
      }
    );

    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
      llm,
      tools: [getUserInfo],
      // highlight-next-line
      stateSchema: CustomState,
    });

    await agent.invoke(
      // highlight-next-line
      { messages: "look up user information", userId: "user_123" }
    );
    ```


## 从工具更新上下文

工具可以在执行过程中修改智能体的状态。这对于持久化中间结果或使信息对后续工具或提示词可访问非常有用。

```ts
import { Annotation, MessagesAnnotation, LangGraphRunnableConfig, Command } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolMessage } from "@langchain/core/messages";
import { initChatModel } from "langchain/chat_models/universal";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const CustomState = Annotation.Root({
  ...MessagesAnnotation.spec,
  // highlight-next-line
  userName: Annotation<string>(), // 将由工具更新
});

const getUserInfo = tool(
  async (
    _input: Record<string, never>,
    config: LangGraphRunnableConfig
  ): Promise<Command> => {
    const userId = config.configurable?.userId;
    if (!userId) {
      throw new Error("Please provide a user id in config.configurable");
    }

    const toolCallId = config.toolCall?.id;

    const name = userId === "user_123" ? "John Smith" : "Unknown user";
    // 返回命令以更新状态
    return new Command({
      update: {
        // highlight-next-line
        userName: name,
        // 更新消息历史
        // highlight-next-line
        messages: [
          new ToolMessage({
            content: "Successfully looked up user information",
            tool_call_id: toolCallId,
          }),
        ],
      },
    });
  },
  {
    name: "get_user_info",
    description: "Look up user information.",
    schema: z.object({}),
  }
);

const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
const agent = createReactAgent({
  llm,
  tools: [getUserInfo],
  // highlight-next-line
  stateSchema: CustomState,
});

await agent.invoke(
  { messages: "look up user information" },
  // highlight-next-line
  { configurable: { userId: "user_123" } }
);
```

更多详细信息，请参见 [how to update state from tools](../how-tos/update-state-from-tools.ipynb)。
