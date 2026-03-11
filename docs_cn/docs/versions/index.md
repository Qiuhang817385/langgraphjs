# LangGraph 发展历程

随着 LangGraph.js 的不断演进和完善，有时需要进行破坏性变更以增强功能、提升性能或改善开发者体验。本页面作为 LangGraph.js 版本历史的指南，记录重要变更并提供版本升级帮助。

## 版本历史

### v0.4.x（最新）

- （破坏性变更）清理 `Interrupt` 接口：移除 `when`、`ns`，改为使用 `id` 和 `values`。
- （破坏性变更）从检查点中移除 `writes`。您需要升级检查点包。
- （破坏性变更）允许从检查点异步序列化和反序列化值。
- （破坏性变更）移除未使用的 SharedValue 和托管值支持。
- 改进可配置字段（0.4.0）和 `streamMode: "updates"`（0.4.4）的类型推断。
- 添加对 `context` 属性和 `Runtime` 类型的支持。
- 在检查点中添加对 `deleteThread` 的支持。
- 添加对 `durability` 属性的支持，取代 `checkpointDuring`。
- 在 `createReactAgent` 中添加对动态模型选择的支持（0.4.3）。
- 在 `createReactAgent["postModelHook"]` 中添加对部分应用工具调用的支持（0.4.3）。
- 大量错误修复。

### v0.3.0

- （破坏性变更）中断现在在 `"values"` 流模式和 `.invoke()` 中正确传播。
- （破坏性变更）`.stream()` 的返回类型现在具有严格类型。
- 添加对[节点/任务缓存](/langgraphjs/how-tos/node-caching/)的支持。
- 添加对[延迟节点](/langgraphjs/how-tos/defer-node-execution/)的支持。
- 在 `createReactAgent` 中添加对 `preModelHook` 和 `postModelHook` 的支持。
- 添加对 `addSequence` 和 `addNode` 的简写对象语法的支持。
- 添加 `pushMessage()` 方法以允许手动向 `"messages"` 流模式推送消息。
- 添加 `isInterrupted()` 方法以检查状态是否包含中断。
- 大量错误修复。

### v0.2.0

- （破坏性变更）[`@langchain/core`](https://www.npmjs.com/package/@langchain/core) 现在是 peer dependency，需要显式安装。
- 添加对[动态断点](/langgraphjs/how-tos/dynamic_breakpoints/)的支持。
- 添加对[独立的输入和输出模式](/langgraphjs/how-tos/input_output_schema/)的支持。
- 允许使用数组指定条件边的目标节点，作为对象的简写形式。
- 大量错误修复。

### v0.1.0

- （破坏性变更）更改检查点表示以支持子图的命名空间和待处理写入。
- （破坏性变更）`MessagesState` 更改为 [`MessagesAnnotation`](/langgraphjs/reference/variables/langgraph.MessagesAnnotation.html)。
- 添加 [`Annotation`](/langgraphjs/reference/modules/langgraph.Annotation.html)，一种更简洁的状态声明方式。无需单独的类型和通道声明。
- 将检查点实现拆分到不同的库中，以便更容易继承。
- 重大内部架构重构，使用更健壮的模式。
- 弃用 `MessageGraph`，改用 [`StateGraph`](/langgraphjs/reference/classes/langgraph.StateGraph.html) + [`MessagesAnnotation`](/langgraphjs/reference/variables/langgraph.MessagesAnnotation.html)。
- 大量错误修复。

## 升级指南

升级 LangGraph.js 时，请参阅以下特定版本部分，了解如何使代码适应最新变更的详细说明。

### 升级到 v0.3.0

- 如果节点被中断，它现在将出现在 `"values"` 流模式和 `.invoke()` 的 `__interrupts` 键下。您可以使用 `isInterrupted()` 方法检查状态是否包含中断并适当处理。
- `.stream()` 的返回类型不再是 `IterableReadableStream<any>`，这意味着您可能需要修复任何类型错误。

### 升级到 v0.2.0

- 您现在需要显式安装 `@langchain/core`。更多信息请参见[此页面](https://langchain-ai.github.io/langgraphjs/how-tos/manage-ecosystem-dependencies/)。

### 升级到 v0.1.0

- 旧的已保存检查点将不再有效，您需要更新以使用新的预构建检查点。
- 我们建议在声明图状态时使用新的 `Annotation` 语法。

## 弃用通知

本节将列出任何已弃用的功能或 API，以及计划移除日期和推荐的替代方案。

#### `MessageGraph`

使用 [`MessagesAnnotation`](/langgraphjs/reference/variables/langgraph.MessagesAnnotation.html) 配合 [`StateGraph`](/langgraphjs/reference/classes/langgraph.StateGraph.html)。

#### `createFunctionCallingExecutor`

使用支持工具调用的模型的 [`createReactAgent`](/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html)。

#### `ToolExecutor`

改用 [`ToolNode`](/langgraphjs/reference/classes/langgraph_prebuilt.ToolNode.html)。

## 完整变更日志

有关 LangGraph.js 版本和变更的最新信息，请参阅我们的 [GitHub 仓库](https://github.com/langchain-ai/langgraphjs) 和 [发布说明](https://github.com/langchain-ai/langgraphjs/releases)。
