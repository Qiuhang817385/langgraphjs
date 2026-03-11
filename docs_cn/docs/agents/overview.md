---
title: 概述
---

# 使用 LangGraph 开发智能体

**LangGraph** 为构建基于智能体的应用程序提供了低级别原语和高级预构建组件。本节重点介绍**预构建**、**可复用**的组件，旨在帮助您快速、可靠地构建智能体系统——无需从头开始实现编排、记忆或人工反馈处理。

## 什么是智能体？

*智能体*由三个组件组成：**大型语言模型（LLM）**、它可以使用的**工具**集，以及提供指令的**提示词**。

LLM 在循环中运行。在每次迭代中，它选择一个工具调用、提供输入、接收结果（观察），并使用该观察来通知下一个动作。循环持续进行，直到满足停止条件——通常是当智能体已收集足够的信息来响应用户。

<figure markdown="1">
![image](./assets/agent.png){: style="max-height:400px"}
<figcaption>智能体循环：LLM 选择工具并使用其输出来满足用户请求。</figcaption>
</figure>

## 关键特性

LangGraph 包含构建健壮、生产就绪的智能体系统所需的几项功能：

- [**记忆集成**](./memory.md)：原生支持*短期*（基于会话）和*长期*（跨会话持久化）记忆，在聊天机器人和助手中实现有状态的行为。
- [**人在回路控制**](./human-in-the-loop.md)：执行可以*无限期*暂停以等待人工反馈——与限于实时交互的基于 websocket 的解决方案不同。这允许在工作流中的任何点进行异步批准、更正或干预。
- [**流式支持**](./streaming.md)：智能体状态、模型 token、工具输出或组合流的实时流式传输。
- [**部署工具**](./deployment.md)：包括无基础设施部署工具。[**LangGraph Platform**](https://langchain-ai.github.io/langgraph/concepts/langgraph_platform/) 支持测试、调试和部署。
  - **[Studio](https://langchain-ai.github.io/langgraph/concepts/langgraph_studio/)**：用于检查和调试工作流的可视化 IDE。
  - 支持多种[**部署选项**](https://langchain-ai.github.io/langgraph/tutorials/deployment/)用于生产。

## 高级构建块

LangGraph 带有一组预构建组件，实现常见的智能体行为和工作流。这些抽象构建在 LangGraph 框架之上，为生产提供更快的路径，同时保持高级自定义的灵活性。

使用 LangGraph 进行智能体开发可以让您专注于应用程序的逻辑和行为，而不是构建和维护用于状态、记忆和人工反馈的支持基础设施。

## 包生态系统

高级组件组织在几个包中，每个包都有特定的关注点。

| 包                       | 描述                                                                        | 安装                                              |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------- |
| `langgraph`              | 用于[**创建智能体**](./agents.md)的预构建组件                                | `npm install @langchain/langgraph @langchain/core` |
| `langgraph-supervisor`   | 用于构建[**supervisor**](./multi-agent.md#supervisor)智能体的工具             | `npm install @langchain/langgraph-supervisor`     |
| `langgraph-swarm`        | 用于构建[**swarm**](./multi-agent.md#swarm)多智能体系统的工具                  | `npm install @langchain/langgraph-swarm`          |
| `langchain-mcp-adapters` | 用于工具和资源整合的[**MCP 服务器**](./mcp.md)接口                            | `npm install @langchain/mcp-adapters`             |
| `agentevals`             | 用于[**评估智能体性能**](./evals.md)的实用工具                               | `npm install agentevals`                          |

## 可视化智能体图

使用以下工具可视化 [`createReactAgent`](/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html) 生成的图，并查看相应代码的大纲。它允许您根据以下内容探索智能体的基础架构：

- [`tools`](./tools.md)：智能体可以用来执行任务的工具（函数、API 或其他可调用对象）列表。
- `preModelHook`：在调用模型之前调用的函数。可用于压缩消息或执行其他预处理任务。
- `postModelHook`：在调用模型之后调用的函数。可用于实现护栏、人在回路流程或其他后处理任务。
- [`responseFormat`](./agents.md#structured-output)：用于约束最终输出类型的数据结构（通过 Zod 模式）。

<div class="agent-layout">
  <div class="agent-graph-features-container">
    <div class="agent-graph-features">
      <h3 class="agent-section-title">功能</h3>
      <label><input type="checkbox" id="tools" checked> <code>tools</code></label>
      <label><input type="checkbox" id="preModelHook"> <code>preModelHook</code></label>
      <label><input type="checkbox" id="postModelHook"> <code>postModelHook</code></label>
      <label><input type="checkbox" id="responseFormat"> <code>responseFormat</code></label>
    </div>
  </div>

  <div class="agent-graph-container">
    <h3 class="agent-section-title">图</h3>
    <img id="agent-graph-img" src="../assets/react_agent_graphs/0001.svg" alt="graph image" style="max-width: 100%;"/>
  </div>
</div>

以下代码片段展示了如何使用 [`createReactAgent`](/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html) 创建上述智能体（和底层图）：

<div class="language-typescript">
  <pre><code id="agent-code" class="language-typescript"></code></pre>
</div>

<script>
function getCheckedValue(id) {
  return document.getElementById(id).checked ? "1" : "0";
}

function getKey() {
  return [
    getCheckedValue("responseFormat"),
    getCheckedValue("postModelHook"),
    getCheckedValue("preModelHook"),
    getCheckedValue("tools")
  ].join("");
}

function dedent(strings, ...values) {
  const str = String.raw({ raw: strings }, ...values)
  const [space] = str.split("\n").filter(Boolean).at(0).match(/^(\s*)/)
  const spaceLen = space.length
  return str.split("\n").map(line => line.slice(spaceLen)).join("\n").trim()
}

Object.assign(dedent, {
  offset: (size) => (strings, ...values) => {
    return dedent(strings, ...values).split("\n").map(line => " ".repeat(size) + line).join("\n")
  }
})




nfunction generateCodeSnippet({ tools, pre, post, response }) {
  const lines = []

  lines.push(dedent`
    import { createReactAgent } from "@langchain/langgraph/prebuilt";
    import { ChatOpenAI } from "@langchain/openai";
  `)

  if (tools) lines.push(`import { tool } from "@langchain/core/tools";`);  
  if (response || tools) lines.push(`import { z } from "zod";`);

  lines.push("", dedent`
    const agent = createReactAgent({
      llm: new ChatOpenAI({ model: "o4-mini" }),
  `)

  if (tools) {
    lines.push(dedent.offset(2)`
      tools: [
        tool(() => "Sample tool output", {
          name: "sampleTool",
          schema: z.object({}),
        }),
      ],
    `)
  }

  if (pre) {
    lines.push(dedent.offset(2)`
      preModelHook: (state) => ({ llmInputMessages: state.messages }),
    `)
  }

  if (post) {
    lines.push(dedent.offset(2)`
      postModelHook: (state) => state,
    `)
  }

  if (response) {
    lines.push(dedent.offset(2)`
      responseFormat: z.object({ result: z.string() }),
    `)
  }

  lines.push(`});`);

  return lines.join("\n");
}

function render() {
  const key = getKey();
  document.getElementById("agent-graph-img").src = `../assets/react_agent_graphs/${key}.svg`;

  const state = {
    tools: document.getElementById("tools").checked,
    pre: document.getElementById("preModelHook").checked,
    post: document.getElementById("postModelHook").checked,
    response: document.getElementById("responseFormat").checked
  };

  document.getElementById("agent-code").textContent = generateCodeSnippet(state);
}

function initializeWidget() {
  render(); // no need for `await` here
  document.querySelectorAll(".agent-graph-features input").forEach((input) => {
    input.addEventListener("change", render);
  });
}

// Init for both full reload and SPA nav (used by MkDocs Material)
window.addEventListener("DOMContentLoaded", initializeWidget);
document$.subscribe(initializeWidget);
</script>
