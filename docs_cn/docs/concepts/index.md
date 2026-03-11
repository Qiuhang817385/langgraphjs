---
title: 概念
description: LangGraph.js 概念指南
---

# 概念指南

本指南提供对 LangGraph 框架背后的关键概念以及更广泛的 AI 应用程序的解释。

我们建议你在深入了解概念指南之前至少先完成[快速入门](../tutorials/quickstart.ipynb)。这将提供有助于更容易理解这里讨论的概念的实践背景。

概念指南不包括分步说明或具体实现示例 —— 这些在[教程](../tutorials/index.md)和[操作指南](../how-tos/index.md)中。有关详细的参考资料，请参阅 [API 参考](https://langchain-ai.github.io/langgraphjs/reference/)。

## LangGraph

### 高级概述

- [为什么选择 LangGraph？](high_level.md)：LangGraph 及其目标的高级概述。

### 概念

- [LangGraph 术语表](low_level.md)：LangGraph 工作流被设计为图，节点代表不同的组件，边代表它们之间的信息流。本指南概述与 LangGraph 图原语相关的关键概念。
- [常见 Agentic 模式](agentic_concepts.md)：Agent 使用 LLM 选择自己的控制流来解决更复杂的问题！Agents 是许多 LLM 应用程序中的关键构建块。本指南解释不同类型的 agent 架构以及它们如何用于控制应用程序的流程。
- [多 Agent 系统](multi_agent.md)：复杂的 LLM 应用程序通常可以分解为多个 agent，每个 agent 负责应用程序的不同部分。本指南解释构建多 agent 系统的常见模式。
- [断点](breakpoints.md)：断点允许在特定点暂停图的执行。断点允许逐步执行图以进行调试。
- [人机协同](human_in_the_loop.md)：解释将人工反馈集成到 LangGraph 应用程序中的不同方式。
- [时间旅行](time-travel.md)：时间旅行允许你在 LangGraph 应用程序中重放过去的操作，以探索替代路径和调试问题。
- [持久化](persistence.md)：LangGraph 具有内置的持久层，通过 checkpointers 实现。此持久层有助于支持强大的功能，如人机协同、记忆、时间旅行和容错。
- [记忆](memory.md)：AI 应用程序中的记忆是指处理、存储和有效回忆过去交互信息的能力。借助记忆，你的 agent 可以从反馈中学习并适应用户的偏好。
- [流式传输](streaming.md)：流式传输对于提高基于 LLM 构建的应用程序的响应速度至关重要。通过逐步显示输出，甚至在完整响应准备好之前，流式传输显著改善用户体验 (UX)，特别是在处理 LLM 延迟时。
- [函数式 API](functional_api.md)：LangGraph 中开发的 [Graph API (StateGraph)](low_level.md#stategraph) 的替代方案。
- [常见问题](faq.md)：关于 LangGraph 的常见问题。

## LangGraph Platform

LangGraph Platform 是一个用于在生产环境中部署 agentic 应用程序的商业解决方案，构建在开源 LangGraph 框架之上。

LangGraph Platform 提供几种不同的部署选项，如[部署选项指南](./deployment_options.md)中所述。

!!! tip

    * LangGraph 是 MIT 许可的开源库，我们致力于维护和增长社区。
    * 你可以随时使用开源 LangGraph 项目在你自己的基础设施上部署 LangGraph 应用程序，而无需使用 LangGraph Platform。

### 高级概述

- [为什么选择 LangGraph Platform？](./langgraph_platform.md)：LangGraph Platform 是一种部署和管理 LangGraph 应用程序的自以为是的方案。本指南概述 LangGraph Platform 背后的关键功能和概念。
- [部署选项](./deployment_options.md)：LangGraph Platform 提供四种部署选项：[自托管精简版](./self_hosted.md#self-hosted-lite)、[自托管企业版](./self_hosted.md#self-hosted-enterprise)、[自带云 (BYOC)](./bring_your_own_cloud.md) 和 [云 SaaS](./langgraph_cloud.md)。本指南解释这些选项之间的差异，以及它们在哪些计划中可用。
- [计划](./plans.md)：LangGraph Platform 提供三种不同的计划：开发者版、增强版、企业版。本指南解释这些选项之间的差异，每个计划可用的部署选项，以及如何注册每个计划。
- [模板应用程序](template_applications.md)：参考应用程序，旨在帮助你在使用 LangGraph 构建时快速入门。

### 组件

LangGraph Platform 包含几个协同工作以支持 LangGraph 应用程序部署和管理的组件：

- [LangGraph Server](./langgraph_server.md)：LangGraph Server 旨在支持广泛的 agentic 应用程序用例，从后台处理到实时交互。
- [LangGraph Studio](./langgraph_studio.md)：LangGraph Studio 是一个专门的 IDE，可以连接到 LangGraph Server，以在本地实现应用程序的可视化、交互和调试。
- [LangGraph CLI](./langgraph_cli.md)：LangGraph CLI 是一个命令行界面，有助于与本地 LangGraph 交互
- [Python/JS SDK](./sdk.md)：Python/JS SDK 提供与已部署的 LangGraph 应用程序交互的编程方式。
- [远程图](../how-tos/use-remote-graph.md)：RemoteGraph 允许你与任何已部署的 LangGraph 应用程序交互，就像它在本地运行一样。

### LangGraph Server

- [应用程序结构](./application_structure.md)：LangGraph 应用程序由一个或多个图、LangGraph API 配置文件 (`langgraph.json`)、指定依赖项的文件和环境变量组成。
- [Assistants](./assistants.md)：Assistants 是保存和管理 LangGraph 应用程序不同配置的一种方式。
- [Web-hooks](./langgraph_server.md#webhooks)：Webhooks 允许你正在运行的 LangGraph 应用程序在特定事件上向外部服务发送数据。
- [Cron 作业](./langgraph_server.md#cron-jobs)：Cron 作业是一种在 LangGraph 应用程序中在特定时间调度任务运行的方式。
- [双重发送](./double_texting.md)：双重发送是 LLM 应用程序中的常见问题，用户可能在图完成运行之前发送多条消息。本指南解释如何使用 LangGraph Deploy 处理双重发送。
- [认证与访问控制](./auth.md)：了解部署 LangGraph Platform 时的认证和访问控制选项。

### 部署选项

- [自托管精简版](./self_hosted.md)：LangGraph Platform 的免费（最多执行 100 万个节点）、有限版本，你可以在本地或以自托管方式运行
- [云 SaaS](./langgraph_cloud.md)：作为 LangSmith 的一部分托管。
- [自带云](./bring_your_own_cloud.md)：我们管理基础设施，所以你不必管理，但所有基础设施都在你的云中运行。
- [自托管企业版](./self_hosted.md)：完全由你管理。
