# LangGraph 术语表

## 图

LangGraph 的核心是将 agent 工作流建模为图。你可以使用三个关键组件定义 agent 的行为：

1. [`State`](#state)：代表应用程序当前快照的共享数据结构。它由 [`Annotation`](/langgraphjs/reference/modules/langgraph.Annotation.html) 对象表示。

2. [`Nodes`](#nodes)：编码 agent 逻辑的 JavaScript/TypeScript 函数。它们接收当前的 `State` 作为输入，执行一些计算或副作用，并返回更新的 `State`。

3. [`Edges`](#edges)：根据当前的 `State` 确定接下来执行哪个 `Node` 的 JavaScript/TypeScript 函数。它们可以是条件分支或固定转换。

通过组合 `Nodes` 和 `Edges`，你可以创建随时间演变 `State` 的复杂循环工作流。真正的力量来自 LangGraph 如何管理 `State`。强调：`Nodes` 和 `Edges` 只不过是 JavaScript/TypeScript 函数 —— 它们可以包含 LLM 或只是普通的 JavaScript/TypeScript 代码。

简而言之：_节点完成工作。边告诉接下来做什么_。

LangGraph 的底层图算法使用[消息传递](https://en.wikipedia.org/wiki/Message_passing)来定义通用程序。当节点完成其操作时，它会沿着一个或多个边向其他节点发送消息。然后，这些接收节点执行其函数，将结果消息传递给下一组节点，依此类推。受 Google 的 [Pregel](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/) 系统启发，程序以离散的"超级步骤"进行。

超级步骤可以被视为对图节点的单次迭代。并行运行的节点属于同一个超级步骤，而顺序运行的节点属于不同的超级步骤。在图执行开始时，所有节点都以 `非活动` 状态开始。当节点在其任何传入边（或"通道"）上收到新消息（状态）时，节点变为 `活动` 状态。然后，活动节点运行其函数并响应更新。在每个超级步骤结束时，没有传入消息的节点通过将自己标记为 `非活动` 来投票 `停止`。当所有节点都处于 `非活动` 状态且没有消息在传输中时，图执行终止。

### StateGraph

`StateGraph` 类是主要使用的图类。它由用户定义的 `State` 对象参数化。（使用 `Annotation` 对象定义，并作为第一个参数传递）

### MessageGraph（旧版） {#messagegraph}

`MessageGraph` 类是一种特殊类型的图。`MessageGraph` 的 `State` 仅是一个消息数组。除了聊天机器人外，此类很少使用，因为大多数应用程序需要比消息数组更复杂的 `State`。

### 编译你的图

要构建你的图，你首先定义[状态](#state)，然后添加[节点](#nodes)和[边](#edges)，然后编译它。编译你的图到底是什么，为什么需要它？

编译是一个相当简单的步骤。它对你的图结构进行一些基本检查（没有孤立节点等）。它也是你可以指定运行时参数（如 checkpointers 和 [断点](#breakpoints)）的地方。你只需调用 `.compile` 方法来编译你的图：

```typescript
const graph = graphBuilder.compile(...);
```

在使用图之前，你**必须**编译它。

## State

定义图时，你要做的第一件事是定义图的 `State`。`State` 包括有关图结构的信息，以及指定如何应用状态更新的 [`reducer` 函数](#reducers)。`State` 的模式将是图中所有 `Nodes` 和 `Edges` 的输入模式，应该使用 [`Annotation`](/langgraphjs/reference/modules/langgraph.Annotation.html) 对象定义。所有 `Nodes` 都会向 `State` 发出更新，然后使用指定的 `reducer` 函数应用这些更新。

### Annotation

指定图模式的方法是定义一个根 [`Annotation`](/langgraphjs/reference/modules/langgraph.Annotation.html) 对象，其中每个键都是状态中的一个项目。

#### 多个模式

通常，所有图节点都使用单个状态注解进行通信。这意味着它们将读取和写入相同的状态通道。但是，在某些情况下，我们希望对此进行更多控制：

- 内部节点可以传递图输入/输出不需要的信息。
- 我们可能还想为图使用不同的输入/输出模式。例如，输出可能只包含单个相关的输出键。

可以让节点在图内部写入私有状态通道以进行内部节点通信。我们可以简单地定义一个私有注解 `PrivateState`。有关更多详细信息，请参阅[此笔记本](../how-tos/pass_private_state.ipynb)。

还可以为图定义显式的输入和输出模式。在这些情况下，我们定义一个包含_所有_与图操作相关的键的"内部"模式。但是，我们还定义 `input` 和 `output` 模式，它们是"内部"模式的子集，以约束图的输入和输出。有关更多详细信息，请参阅[此指南](../how-tos/input_output_schema.ipynb)。

让我们看一个示例：

```ts
import {
  Annotation,
  START,
  StateGraph,
  StateType,
  UpdateType,
} from "@langchain/langgraph";

const InputStateAnnotation = Annotation.Root({
  user_input: Annotation<string>,
});

const OutputStateAnnotation = Annotation.Root({
  graph_output: Annotation<string>,
});

const OverallStateAnnotation = Annotation.Root({
  foo: Annotation<string>,
  bar: Annotation<string>,
  user_input: Annotation<string>,
  graph_output: Annotation<string>,
});

const node1 = async (state: typeof InputStateAnnotation.State) => {
  // 写入 OverallStateAnnotation
  return { foo: state.user_input + " name" };
};

const node2 = async (state: typeof OverallStateAnnotation.State) => {
  // 从 OverallStateAnnotation 读取，写入 OverallStateAnnotation
  return { bar: state.foo + " is" };
};

const node3 = async (state: typeof OverallStateAnnotation.State) => {
  // 从 OverallStateAnnotation 读取，写入 OutputStateAnnotation
  return { graph_output: state.bar + " Lance" };
};

// 大多数情况下，StateGraph 类型参数由 TypeScript 推断，
// 但这是一个特殊情况，必须显式指定以避免类型错误。
const graph = new StateGraph<
  (typeof OverallStateAnnotation)["spec"],
  StateType<(typeof OverallStateAnnotation)["spec"]>,
  UpdateType<(typeof OutputStateAnnotation)["spec"]>,
  typeof START,
  (typeof InputStateAnnotation)["spec"],
  (typeof OutputStateAnnotation)["spec"]
>({
  input: InputStateAnnotation,
  output: OutputStateAnnotation,
  stateSchema: OverallStateAnnotation,
})
  .addNode("node1", node1)
  .addNode("node2", node2)
  .addNode("node3", node3)
  .addEdge("__start__", "node1")
  .addEdge("node1", "node2")
  .addEdge("node2", "node3")
  .compile();

await graph.invoke({ user_input: "My" });
```

```
{ graph_output: "My name is Lance" }
```

请注意，我们将 `state: typeof InputStateAnnotation.State` 作为 `node1` 的输入模式传递。但是，我们写入 `foo`，即 `OverallStateAnnotation` 中的一个通道。我们如何写入不在输入模式中的状态通道？这是因为节点_可以写入图状态中的任何状态通道_。图状态是初始化时定义的状态通道的并集，包括 `OverallStateAnnotation` 和过滤器 `InputStateAnnotation` 和 `OutputStateAnnotation`。

### Reducers

Reducers 是理解如何将节点的更新应用到 `State` 的关键。`State` 中的每个键都有自己独立的 reducer 函数。如果没有显式指定 reducer 函数，则假定对该键的所有更新都应覆盖它。让我们看几个示例来更好地理解它们。

**示例 A：**

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";

const State = Annotation.Root({
  foo: Annotation<number>,
  bar: Annotation<string[]>,
});

const graphBuilder = new StateGraph(State);
```

在此示例中，没有为任何键指定 reducer 函数。假设图的输入是 `{ foo: 1, bar: ["hi"] }`。然后假设第一个 `Node` 返回 `{ foo: 2 }`。这被视为对状态的更新。请注意，`Node` 不需要返回整个 `State` 模式 —— 只需要更新。应用此更新后，`State` 将变为 `{ foo: 2, bar: ["hi"] }`。如果第二个节点返回 `{ bar: ["bye"] }`，则 `State` 将变为 `{ foo: 2, bar: ["bye"] }`

**示例 B：**

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";

const State = Annotation.Root({
  foo: Annotation<number>,
  bar: Annotation<string[]>({
    reducer: (state: string[], update: string[]) => state.concat(update),
    default: () => [],
  }),
});

const graphBuilder = new StateGraph(State);
```

在此示例中，我们已将 `bar` 字段更新为包含 `reducer` 函数的对象。此函数将始终接受两个位置参数：`state` 和 `update`，其中 `state` 代表当前状态值，`update` 代表从 `Node` 返回的更新。请注意，第一个键保持不变。假设图的输入是 `{ foo: 1, bar: ["hi"] }`。然后假设第一个 `Node` 返回 `{ foo: 2 }`。这被视为对状态的更新。请注意，`Node` 不需要返回整个 `State` 模式 —— 只需要更新。应用此更新后，`State` 将变为 `{ foo: 2, bar: ["hi"] }`。如果第二个节点返回`{ bar: ["bye"] }`，则 `State` 将变为 `{ foo: 2, bar: ["hi", "bye"] }`。请注意，`bar` 键通过将两个数组合并在一起来更新。

### 在图状态中使用消息

#### 为什么要使用消息？

大多数现代 LLM 提供商都有一个聊天模型接口，接受消息列表作为输入。LangChain 的 [`ChatModel`](https://js.langchain.com/docs/concepts/#chat-models) 特别接受 `Message` 对象列表作为输入。这些消息具有多种形式，例如 `HumanMessage`（用户输入）或 `AIMessage`（LLM 响应）。要详细了解什么是消息对象，请参阅[此](https://js.langchain.com/docs/concepts/#message-types)概念指南。

#### 在你的图中使用消息

在许多情况下，在图状态中存储先前的对话历史作为消息列表很有帮助。为此，我们可以向图状态添加一个存储 `Message` 对象列表的键（通道），并用 reducer 函数对其进行注解（参见下面的示例中的 `messages` 键）。Reducer 函数对于告诉图如何在每次状态更新时（例如，当节点发送更新时）更新 `Message` 对象列表至关重要。如果你不指定 reducer，每次状态更新都会用最近提供的值覆盖消息列表。

但是，你可能还想手动更新图状态中的消息（例如，人机协同）。如果你使用类似 `(a, b) => a.concat(b)` 的 reducer，你发送到图的手动状态更新将附加到现有消息列表，而不是更新现有消息。为了避免这种情况，你需要一个可以跟踪消息 ID 并在更新时覆盖现有消息的 reducer。为了实现这一点，你可以使用预构建的 `messagesStateReducer` 函数。对于全新的消息，它将简单地附加到现有列表，但它也会正确处理现有消息的更新。

#### 序列化

除了跟踪消息 ID 之外，`messagesStateReducer` 函数还将尝试在 `messages` 通道上收到状态更新时将消息反序列化为 LangChain `Message` 对象。这允许以以下格式发送图输入/状态更新：

```ts
// 支持此格式
{
  messages: [new HumanMessage({ content: "message" })];
}

// 也支持此格式
{
  messages: [{ role: "user", content: "message" }];
}
```

以下是使用 `messagesStateReducer` 作为其 reducer 函数的图状态注解示例。

```ts
import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, type Messages } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[], Messages>({
    reducer: messagesStateReducer,
  }),
});
```

#### MessagesAnnotation

由于在状态中包含消息列表非常常见，因此存在一个名为 `MessagesAnnotation` 的预构建注解，使将消息用作图状态变得容易。`MessagesAnnotation` 使用单个 `messages` 键定义，该键是 `BaseMessage` 对象的列表，并使用 `messagesStateReducer` reducer。

```typescript
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

const graph = new StateGraph(MessagesAnnotation)
  .addNode(...)
  ...
```

等同于像这样手动初始化你的状态：

```typescript
import { BaseMessage } from "@langchain/core/messages";
import { Annotation, StateGraph, messagesStateReducer } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

const graph = new StateGraph(StateAnnotation)
  .addNode(...)
  ...
```

`MessagesAnnotation` 的状态有一个名为 `messages` 的键。这是一个 `BaseMessage` 数组，使用 [`messagesStateReducer`](/langgraphjs/reference/functions/langgraph.messagesStateReducer.html) 作为 reducer。`messagesStateReducer` 基本上将消息添加到现有列表（它还做了一些额外的好事，如从 OpenAI 消息格式转换为标准 LangChain 消息格式，基于消息 ID 处理更新等）。

我们经常看到消息数组是状态的关键组成部分，因此这个预构建状态旨在使使用消息变得容易。通常，要跟踪的状态比消息更多，因此我们看到人们扩展此状态并添加更多字段，例如：

```typescript
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const StateWithDocuments = Annotation.Root({
  ...MessagesAnnotation.spec, // 展开消息状态
  documents: Annotation<string[]>,
});
```

#### Zod 中的消息

如果你使用 Zod 定义图状态，你可以使用来自 `@langchain/langgraph/zod` 的 `MessagesZodMeta` 模式与 `registry` 一起定义消息状态。

```typescript
import type { BaseMessage } from "@langchain/core/messages";
import { MessagesZodMeta, StateGraph } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { z } from "zod/v4";

const MessagesZodState = z.object({
  messages: z.custom<BaseMessage[]>().register(registry, MessagesZodMeta),
});

const graph = new StateGraph(MessagesZodState)
  .addNode(...)
  ...
```

??? note "使用 Zod 3？"

    如果你使用 Zod 3，你可以改用预构建的 `MessagesZodState`。

    ```typescript
    import { MessagesZodState, StateGraph } from "@langchain/langgraph";

    import { z } from "zod";

    const graph = new StateGraph(MessagesZodState)
      .addNode(...)
      ...
    ```

有关使用 Zod 定义图状态的更多信息，请参阅[定义图状态操作指南](/langgraphjs/how-tos/define-state/#using-zod)。

## 节点

在 LangGraph 中，节点通常是 JavaScript/TypeScript 函数（同步或 `async`），其中**第一个**位置参数是[状态](#state)，（可选地），**第二个**位置参数是"配置"，包含可选的[可配置参数](#configuration)（如 `thread_id`）。

类似于 `NetworkX`，你可以使用 [addNode](/langgraphjs/reference/classes/langgraph.StateGraph.html#addNode) 方法将这些节点添加到图中：

```typescript
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, Annotation } from "@langchain/langgraph";

const GraphAnnotation = Annotation.Root({
  input: Annotation<string>,
  results: Annotation<string>,
});

// 可以使用 `typeof <annotation variable name>.State` 提取状态类型
const myNode = (state: typeof GraphAnnotation.State, config?: RunnableConfig) => {
  console.log("In node: ", config.configurable?.user_id);
  return {
    results: `Hello, ${state.input}!`
  };
};

// 第二个参数是可选的
const myOtherNode = (state: typeof GraphAnnotation.State) => {
  return state;
};

const builder = new StateGraph(GraphAnnotation)
  .addNode("myNode", myNode)
  .addNode("myOtherNode", myOtherNode)
  ...
```

在幕后，函数被转换为 [RunnableLambda](https://v02.api.js.langchain.com/classes/langchain_core_runnables.RunnableLambda.html)，它为你的函数添加批处理和流式传输支持，以及原生跟踪和调试。

### `START` 节点

`START` 节点是一个特殊节点，代表向图发送用户输入的节点。引用此节点的主要目的是确定应该首先调用哪些节点。

```typescript
import { START } from "@langchain/langgraph";

graph.addEdge(START, "nodeA");
```

### `END` 节点

`END` 节点是一个特殊节点，代表终端节点。当你想表示哪些边在执行后没有后续操作时，会引用此节点。

```typescript
import { END } from "@langchain/langgraph";

graph.addEdge("nodeA", END);
```

## 边

边定义逻辑如何路由以及图如何决定停止。这是你的 agent 如何工作以及不同节点如何相互通信的重要组成部分。有几种关键类型的边：

- 普通边：直接从一个节点到下一个节点。
- 条件边：调用函数以确定接下来转到哪个节点。
- 入口点：当用户输入到达时首先调用哪个节点。
- 条件入口点：调用函数以确定当用户输入到达时首先调用哪个节点。

一个节点可以有多个传出边。如果一个节点有多个传出边，则这些目标节点将作为下一个超级步骤的一部分**全部**并行执行。

### 普通边

如果你**始终**想从节点 A 转到节点 B，你可以直接使用 [addEdge](/langgraphjs/reference/classes/langgraph.StateGraph.html#addEdge) 方法。

```typescript
graph.addEdge("nodeA", "nodeB");
```

### 条件边

如果你想**可选地**路由到 1 个或多个边（或可选地终止），你可以使用 [addConditionalEdges](/langgraphjs/reference/classes/langgraph.StateGraph.html#addConditionalEdges) 方法。此方法接受节点名称和在该节点执行后要调用的"路由函数"：

```typescript
graph.addConditionalEdges("nodeA", routingFunction);
```

与节点类似，`routingFunction` 接受图的当前 `state` 并返回值。

默认情况下，`routingFunction` 的返回值用作将状态发送到的节点名称（或节点数组）。所有这些节点将作为下一个超级步骤的一部分并行运行。

你可以可选地提供一个对象，将 `routingFunction` 的输出映射到下一个节点的名称。

```typescript
graph.addConditionalEdges("nodeA", routingFunction, {
  true: "nodeB",
  false: "nodeC",
});
```

!!! tip
如果你想在单个函数中结合状态更新和路由，请使用 [`Command`](#command) 代替条件边。

### 入口点

入口点是图启动时首先运行的节点。你可以使用 [`addEdge`](/langgraphjs/reference/classes/langgraph.StateGraph.html#addEdge) 方法从虚拟的 [`START`](/langgraphjs/reference/variables/langgraph.START.html) 节点到要执行的第一个节点来指定进入图的位置。

```typescript hl_lines="4"
import { START } from "@langchain/langgraph";

const graph = new StateGraph(...)
  .addEdge(START, "nodeA")
  .compile();
```

### 条件入口点

条件入口点允许你根据自定义逻辑从不同节点开始。你可以使用从虚拟的 [`START`](/langgraphjs/reference/variables/langgraph.START.html) 节点的 [`addConditionalEdges`](/langgraphjs/reference/classes/langgraph.StateGraph.html#addConditionalEdges) 来实现这一点。

```typescript hl_lines="4"
import { START } from "@langchain/langgraph";

const graph = new StateGraph(...)
  .addConditionalEdges(START, routingFunction)
  .compile();
```

你可以可选地提供一个对象，将 `routingFunction` 的输出映射到下一个节点的名称。

```typescript hl_lines="2-5"
const graph = new StateGraph(...)
  .addConditionalEdges(START, routingFunction, {
    true: "nodeB",
    false: "nodeC",
  })
  .compile();
```

## `Send`

默认情况下，`Nodes` 和 `Edges` 是预先定义的，并在相同的共享状态上操作。但是，在某些情况下，确切的边事先不知道，和/或你可能希望同时存在不同版本的 `State`。此设计模式的常见示例是 `map-reduce`。在这种设计模式中，第一个节点可能生成一个对象数组，你可能希望将所有这些对象应用于某个其他节点。对象的数量可能事先不知道（意味着边的数量可能不知道），下游 `Node` 的输入 `State` 应该不同（每个生成的对象一个）。

为了支持这种设计模式，LangGraph 支持从条件边返回 [`Send`](/langgraphjs/reference/classes/langgraph.Send.html) 对象。`Send` 接受两个参数：第一个是节点名称，第二个是要传递给该节点的状态。

```typescript hl_lines="8"
const continueToJokes = (state: { subjects: string[] }) => {
  return state.subjects.map(
    (subject) => new Send("generate_joke", { subject })
  );
};

const graph = new StateGraph(...)
  .addConditionalEdges("nodeA", continueToJokes)
  .compile();
```

## `Command`

!!! tip 兼容性
此功能需要 `@langchain/langgraph>=0.2.31`。

将控制流（边）和状态更新（节点）结合起来会很方便。例如，你可能希望在同一个节点中**同时**执行状态更新**并**决定接下来转到哪个节点，而不是使用条件边。LangGraph 提供了一种通过从节点函数返回 [`Command`](https://langchain-ai.github.io/langgraphjs/reference/classes/langgraph.Command.html) 对象来实现这一点的方法：

```ts
import { StateGraph, Annotation, Command } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

const myNode = (state: typeof StateAnnotation.State) => {
  return new Command({
    // 状态更新
    update: {
      foo: "bar",
    },
    // 控制流
    goto: "myOtherNode",
  });
};
```

使用 `Command`，你还可以实现动态控制流行为（与[条件边](#conditional-edges)相同）：

```ts
const myNode = async (state: typeof StateAnnotation.State) => {
  if (state.foo === "bar") {
    return new Command({
      update: {
        foo: "baz",
      },
      goto: "myOtherNode",
    });
  }
  // ...
};
```

!!! important

    在节点函数中返回 `Command` 时，你还必须添加一个 `ends` 参数，其中包含节点正在路由到的节点名称列表，例如 `.addNode("myNode", myNode, { ends: ["myOtherNode"] })`。这对于图编译和验证是必要的，并表明 `myNode` 可以导航到 `myOtherNode`。

查看此[操作指南](../how-tos/command.ipynb)以获取有关如何使用 `Command` 的端到端示例。

### 何时应该使用 Command 而不是条件边？

当你需要**同时**更新图状态**并**路由到不同节点时，请使用 `Command`。例如，在实现[多 agent 交接](./multi_agent.md#handoffs)时，路由到不同的 agent 并传递一些信息给该 agent 很重要。

使用[条件边](#conditional-edges)在不更新状态的情况下在节点之间进行条件路由。

### 导航到父图中的节点

如果你正在使用[子图](#subgraphs)，你可能希望从子图的节点导航到不同的子图（即父图中的不同节点）。为此，你可以在 `Command` 中指定 `graph: Command.PARENT`：

```ts
const myNode = (state: typeof StateAnnotation.State) => {
  return new Command({
    update: { foo: "bar" },
    goto: "other_subgraph", // 其中 `other_subgraph` 是父图中的节点
    graph: Command.PARENT,
  });
};
```

!!! note

    将 `graph` 设置为 `Command.PARENT` 将导航到最近的父图。

这在实现[多 agent 交接](./multi_agent.md#handoffs)时特别有用。

### 在工具内部使用

一个常见的用例是从工具内部更新图状态。例如，在客户支持应用程序中，你可能希望在对话开始时根据客户的账号或 ID 查找客户信息。要从工具更新图状态，你可以从工具返回 `Command({ update: { my_custom_key: "foo", messages: [...] } })`：

```ts
import { tool } from "@langchain/core/tools";

const lookupUserInfo = tool(async (input, config) => {
  const userInfo = getUserInfo(config);
  return new Command({
    // 更新状态键
    update: {
      user_info: userInfo,
      messages: [
        new ToolMessage({
          content: "Successfully looked up user information",
          tool_call_id: config.toolCall.id,
        }),
      ],
    },
  });
}, {
  name: "lookup_user_info",
  description: "Use this to look up user information to better assist them with their questions.",
  schema: z.object(...)
});
```

!!! important
当从工具返回 `Command` 时，你必须在 `Command.update` 中包含 `messages`（或用于消息历史的任何状态键），并且 `messages` 中的消息列表必须包含 `ToolMessage`。这对于结果消息历史有效是必要的（LLM 提供商要求 AI 消息与工具调用后跟工具结果消息）。

如果你使用的是通过 `Command` 更新状态的工具，我们建议使用预构建的 [`ToolNode`](/langgraphjs/reference/classes/langgraph_prebuilt.ToolNode.html)，它会自动处理返回 `Command` 对象的工具并将它们传播到图状态。如果你正在编写调用工具的自定义节点，则需要手动将工具返回的 `Command` 对象作为节点的更新进行传播。

### 人机协同

`Command` 是人机协同工作流的重要组成部分：当使用 `interrupt()` 收集用户输入时，`Command` 然后用于通过 `new Command({ resume: "User input" })` 提供输入并恢复执行。查看[此概念指南](/langgraphjs/concepts/human_in_the_loop)以获取更多信息。

## 持久化

LangGraph 使用 [checkpointers](/langgraphjs/reference/classes/checkpoint.BaseCheckpointSaver.html) 为你的 agent 状态提供内置持久化。Checkpointers 在每个超级步骤保存图状态的快照，允许随时恢复。这启用了人机协同交互、记忆管理和容错等功能。你甚至可以在执行后使用适当的 `get` 和 `update` 方法直接操作图的状态。有关更多详细信息，请参阅[概念指南](/langgraphjs/concepts/persistence)。

## 线程

LangGraph 中的线程代表你的图与用户之间的单个会话或对话。使用检查点时，单个对话中的轮次（甚至单个图执行中的步骤）由唯一的线程 ID 组织。

## 存储

LangGraph 通过 [BaseStore](/langgraphjs/reference/classes/store.BaseStore.html) 接口提供内置文档存储。与按线程 ID 保存状态的 checkpointers 不同，存储使用自定义命名空间来组织数据。这支持跨线程持久化，允许 agent 维持长期记忆、从过去的交互中学习并随着时间积累知识。常见用例包括存储用户配置文件、构建知识库以及管理跨所有线程的全局偏好设置。

## 图迁移

LangGraph 可以轻松处理图定义（节点、边和状态）的迁移，即使在使用 checkpointer 跟踪状态时也是如此。

- 对于在图末尾的线程（即未中断），你可以更改整个图的拓扑结构（即所有节点和边，删除、添加、重命名等）
- 对于当前被中断的线程，我们支持除重命名/删除节点之外的所有拓扑更改（因为该线程现在可能即将进入不再存在的节点）—— 如果这是一个阻碍，请联系我们，我们可以优先考虑解决方案。
- 对于修改状态，我们对添加和删除键具有完全的向后和向前兼容性
- 重命名的状态键在现有线程中丢失其保存的状态
- 类型以不兼容方式更改的状态键目前可能会导致具有更改前状态的线程出现问题 —— 如果这是一个阻碍，请联系我们，我们可以优先考虑解决方案。

## 配置

创建图时，你还可以标记图的某些部分是可配置的。这通常是为了轻松切换模型或系统提示。这允许你创建单个"认知架构"（图），但有多个不同的实例。

然后，你可以使用 `configurable` 配置字段将此配置传递到图中。

```typescript
const config = { configurable: { llm: "anthropic" } };

await graph.invoke(inputs, config);
```

然后，你可以在节点内部访问和使用此配置：

```typescript
const nodeA = (state, config) => {
  const llmType = config?.configurable?.llm;
  let llm: BaseChatModel;
  if (llmType) {
    const llm = getLlm(llmType);
  }
  ...
};

```

有关配置的完整分解，请参阅[此指南](../how-tos/configuration.ipynb)。

### 递归限制

递归限制设置图在单次执行期间可以执行的 [super-steps](#graphs) 的最大数量。一旦达到限制，LangGraph 将引发 `GraphRecursionError`。默认情况下，此值设置为 25 步。递归限制可以在任何图上在运行时设置，并通过配置字典传递给 `.invoke`/`.stream`。重要的是，`recursionLimit` 是一个独立的 `config` 键，不应像所有其他用户定义的配置一样传递在 `configurable` 键内。请参阅下面的示例：

```ts
await graph.invoke(inputs, { recursionLimit: 50 });
```

阅读[此操作指南](/langgraphjs/how-tos/recursion-limit/)以了解有关递归限制如何工作的更多信息。

## `interrupt`

使用 [interrupt](/langgraphjs/reference/functions/langgraph.interrupt-1.html) 函数在特定点**暂停**图以收集用户输入。`interrupt` 函数将中断信息呈现给客户端，允许开发人员收集用户输入、验证图状态或在恢复执行之前做出决策。

```ts
import { interrupt } from "@langchain/langgraph";

const humanApprovalNode = (state: typeof StateAnnotation.State) => {
  ...
  const answer = interrupt(
      // 此值将发送到客户端。
      // 它可以是任何 JSON 可序列化的值。
      { question: "is it ok to continue?"},
  );
  ...
```

通过向图传递一个 `resume` 键设置为 `interrupt` 函数返回值的 [`Command`](#command) 对象来恢复图。

在 [人机协同概念指南](./human_in_the_loop.md) 中阅读有关 `interrupt` 如何用于 **人机协同** 工作流的更多信息。

**注意：** `interrupt` 函数目前在 [Web 环境](/langgraphjs/how-tos/use-in-web-environments/)中不可用。

## 断点

断点在特定点暂停图执行，并允许逐步执行。断点由 LangGraph 的 [**持久层**](./persistence.md) 提供支持，该层在每个图步骤后保存状态。断点还可用于启用 [**人机协同**](./human_in_the_loop.md) 工作流，但我们建议为此目的使用 [`interrupt` 函数](#interrupt)。

在 [断点概念指南](./breakpoints.md) 中阅读有关断点的更多信息。

## 子图

子图是在另一个图中用作 [节点](#nodes) 的 [图](#graphs)。这不过是应用于 LangGraph 的古老封装概念。使用子图的一些原因：

- 构建 [多 agent 系统](./multi_agent.md)
- 当你想在多个图中重用一组节点时，它们可能共享一些状态，你可以在一个子图中定义它们，然后在多个父图中使用
- 当你希望不同的团队在图的不同部分独立工作时，你可以将每个部分定义为子图，只要子图接口（输入和输出模式）得到尊重，父图就可以构建而无需了解子图的任何细节

有两种方法将子图添加到父图：

- 添加具有已编译子图的节点：这适用于父图和子图共享状态键且你不需要在进出时转换状态的情况

```ts
.addNode("subgraph", subgraphBuilder.compile());
```

- 添加具有调用子图的函数的节点：这适用于父图和子图具有不同状态模式且你需要在调用子图之前或之后转换状态的情况

```ts hl_lines="8"
const subgraph = subgraphBuilder.compile();

const callSubgraph = async (state: typeof StateAnnotation.State) => {
  return subgraph.invoke({ subgraph_key: state.parent_key });
};

const builder = new StateGraph(...)
  .addNode("subgraph", callSubgraph)
  .compile();
```

让我们看一下每种方法的示例。

### 作为编译图

创建子图节点的最简单方法是直接使用 [编译子图](#compiling-your-graph)。这样做时，**重要的是**父图和子图 [状态模式](#state) 至少共享一个可用于通信的键。如果你的图和子图不共享任何键，你应该使用函数来编写[调用子图](#as-a-function)。

<div class="admonition note">
    <p class="admonition-title">注意</p>
    <p>
      如果你向子图节点传递额外的键（即，除了共享键之外），它们将被子图节点忽略。类似地，如果你从子图返回额外的键，它们将被父图忽略。
    </p>
</div>

```ts
import { StateGraph, Annotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

const SubgraphStateAnnotation = Annotation.Root({
  foo: Annotation<string>, // 注意此键与父图状态共享
  bar: Annotation<string>,
});

// 定义子图
const subgraphNode = async (state: typeof SubgraphStateAnnotation.State) => {
  // 注意此子图节点可以通过共享的 "foo" 键与父图通信
  return { foo: state.foo + "bar" };
};

const subgraph = new StateGraph(SubgraphStateAnnotation)
  .addNode("subgraph", subgraphNode);
  ...
  .compile();

// 定义父图
const parentGraph = new StateGraph(StateAnnotation)
  .addNode("subgraph", subgraph)
  ...
  .compile();
```

### 作为函数

你可能希望定义一个具有完全不同模式的子图。在这种情况下，你可以创建一个调用子图的节点函数。此函数需要在调用子图之前将输入（父）状态[转换](../how-tos/subgraph-transform-state.ipynb)为子图状态，并在从节点返回状态更新之前将结果转换回父状态。

```ts
import { StateGraph, Annotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

const SubgraphStateAnnotation = Annotation.Root({
  // 注意这些键都不与父图状态共享
  bar: Annotation<string>,
  baz: Annotation<string>,
});

// 定义子图
const subgraphNode = async (state: typeof SubgraphStateAnnotation.State) => {
  return { bar: state.bar + "baz" };
};

const subgraph = new StateGraph(SubgraphStateAnnotation)
  .addNode("subgraph", subgraphNode);
  ...
  .compile();

// 定义父图
const subgraphWrapperNode = async (state: typeof StateAnnotation.State) => {
  // 将状态转换为子图状态
  const response = await subgraph.invoke({
    bar: state.foo,
  });
  // 将响应转换回父状态
  return {
    foo: response.bar,
  };
}

const parentGraph = new StateGraph(StateAnnotation)
  .addNode("subgraph", subgraphWrapperNode)
  ...
  .compile();
```

## 可视化

通常能够可视化图是很好的，特别是当它们变得更加复杂时。LangGraph 带有一个很好的内置方式将图渲染为 Mermaid 图表。你可以像这样使用 `getGraph()` 方法：

```ts
const representation = graph.getGraph();
const image = await representation.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);
```

你还可以查看 [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio) 以获取包含强大可视化和调试功能的专门 IDE。

## 流式传输

LangGraph 内置一流的流式传输支持。LangGraph 支持几种不同的流式传输模式：

- [`"values"`](../how-tos/stream-values.ipynb)：这会在图的每个步骤后流式传输状态的完整值。
- [`"updates`](../how-tos/stream-updates.ipynb)：这会在图的每个步骤后流式传输状态的更新。如果在同一步骤中进行多个更新（例如，运行多个节点），则这些更新将单独流式传输。

此外，你可以使用 [`streamEvents`](https://api.js.langchain.com/classes/langchain_core_runnables.Runnable.html#streamEvents) 方法来流式传输节点_内部_发生的事件。这对于[流式传输 LLM 调用的令牌](../how-tos/streaming-tokens-without-langchain.ipynb)很有用。

LangGraph 内置一流的流式传输支持，包括在节点执行期间从图节点流式传输更新、从 LLM 调用流式传输令牌等。有关更多信息，请参阅此[概念指南](./streaming.md)。
