# LangGraph Server

!!! info "先决条件"
    - [LangGraph Platform](./langgraph_platform.md)
    - [LangGraph 术语表](low_level.md)

## 概述

LangGraph Server 为创建和管理基于 agent 的应用程序提供 API。它建立在 [assistants](assistants.md) 的概念之上，assistants 是为特定任务配置的 agent，包括内置的[持久化](persistence.md#memory-store)和**任务队列**。这个多功能的 API 支持广泛的 agentic 应用程序用例，从后台处理到实时交互。

## 主要功能

LangGraph Platform 结合了 agent 部署的最佳实践，因此你可以专注于构建 agent 逻辑。

* **流式传输端点**：公开[多种不同流式传输模式](streaming.md)的端点。我们已经使这些功能即使对于可能在连续流事件之间停留数分钟的长时间运行的 agent 也能正常工作。
* **后台运行**：LangGraph Server 支持在后台启动 assistants，并提供用于轮询 assistant 运行状态的端点和用于有效监控运行状态的 webhooks。
- **支持长时间运行**：我们用于运行 assistants 的阻塞端点发送常规心跳信号，防止在处理需要很长时间才能完成的请求时意外关闭连接。
* **任务队列**：我们添加了任务队列，以确保如果请求以突发方式到达，我们不会丢弃任何请求。
* **水平可扩展的基础设施**：LangGraph Server 设计为水平可扩展，允许你根据需要扩展使用。
* **双重发送支持**：很多时候用户可能会以非预期的方式与你的图交互。例如，用户可能发送一条消息，然后在图完成运行之前发送第二条消息。我们称这为["双重发送"](double_texting.md)，并添加了四种不同的处理方式。
* **优化的 checkpointer**：LangGraph Platform 附带一个为 LangGraph 应用程序优化的内置 [checkpointer](./persistence.md#checkpoints)。
* **人机协同端点**：我们公开了支持[人机协同](human_in_the_loop.md)功能所需的所有端点。
* **记忆**：除了线程级持久化（由上面的 [checkpointers] 涵盖）之外，LangGraph Platform 还附带一个内置的[记忆存储](persistence.md#memory-store)。
* **Cron 作业**：内置的任务调度支持，使你能够自动化应用程序中的常规操作，如数据清理或批处理。
* **Webhooks**：允许你的应用程序向外部系统发送实时通知和数据更新，使与第三方服务集成和基于特定事件触发操作变得容易。
* **监控**：LangGraph Server 与 [LangSmith](https://docs.smith.langchain.com/) 监控平台无缝集成，为你的应用程序的性能和健康提供实时洞察。

## 你在部署什么？

当你部署 LangGraph Server 时，你正在部署一个或多个[图](#graphs)、用于[持久化](persistence.md)的数据库和任务队列。

### 图

当你使用 LangGraph Server 部署图时，你正在部署 [Assistant](assistants.md) 的"蓝图"。

[Assistant](assistants.md) 是具有特定配置设置的图。你可以为每个图创建多个 assistant，每个 assistant 具有独特的设置，以适应可以由同一图服务的不同用例。

部署后，LangGraph Server 将使用图的默认配置设置自动为每个图创建一个默认 assistant。

你可以通过 [LangGraph Server API](#langgraph-server-api) 与 assistants 交互。

!!! note

    我们经常将图视为实现 [agent](agentic_concepts.md)，但图不一定需要实现 agent。例如，图可以实现一个简单的
    聊天机器人，仅支持来回对话，而不会影响任何应用程序控制流。实际上，随着应用程序变得更加复杂，图通常会实现一个使用[多个 agent](./multi_agent.md) 协同工作的更复杂的流程。

### 持久化和任务队列

LangGraph Server 利用数据库进行[持久化](persistence.md)和任务队列。

目前，LangGraph Server 仅支持 [Postgres](https://www.postgresql.org/) 作为数据库，[Redis](https://redis.io/) 作为任务队列。

如果你使用 [LangGraph Cloud](./langgraph_cloud.md) 进行部署，这些组件将为你管理。如果你在自己的基础设施上部署 LangGraph Server，则需要自己设置和管理这些组件。

请查看[部署选项](./deployment_options.md)指南以获取有关这些组件如何设置和管理的更多信息。

## 应用程序结构

要部署 LangGraph Server 应用程序，你需要指定要部署的图以及任何相关配置设置，如依赖项和环境变量。

阅读[应用程序结构](./application_structure.md)指南以了解如何构建 LangGraph 应用程序以进行部署。

## LangGraph Server API

LangGraph Server API 允许你创建和管理 [assistants](assistants.md)、[线程](#threads)、[运行](#runs)、[cron 作业](#cron-jobs) 等。

[LangGraph Cloud API 参考](/langgraphjs/cloud/reference/api/api_ref.html)提供有关 API 端点和数据模型的详细信息。

### Assistants

[Assistant](assistants.md) 是指具有特定[配置](low_level.md#configuration)设置的[图](#graphs)。

你可以将 assistant 视为 [agent](agentic_concepts.md) 的保存配置。

在构建 agent 时，进行快速更改是很常见的，这些更改*不会*改变图逻辑。例如，简单地更改提示或 LLM 选择可能会对 agent 的行为产生重大影响。Assistants 提供了一种简单的方法来保存这些类型的 agent 配置更改。

### 线程

线程包含一系列[运行](#runs)的累积状态。如果在线程上执行运行，则 assistant 底层图的[状态](low_level.md#state)将持久化到线程。

可以检索线程的当前和历史状态。要持久化状态，必须在执行运行之前创建线程。

线程在特定时间点的状态称为[检查点](persistence.md#checkpoints)。检查点可用于在以后的时间恢复线程的状态。

有关线程和检查点的更多信息，请参阅 [LangGraph 概念指南](low_level.md#persistence)的此部分。

LangGraph Cloud API 提供多个用于创建和管理线程和线程状态的端点。有关更多详细信息，请参阅 [API 参考](/langgraphjs/cloud/reference/api/api_ref.html#tag/threadscreate)。

### 运行

运行是 [assistant](#assistants) 的调用。每次运行可能有自己的输入、配置和元数据，这可能会影响底层图的执行和输出。可以选择在 [线程](#threads) 上执行运行。

LangGraph Cloud API 提供多个用于创建和管理运行的端点。有关更多详细信息，请参阅 [API 参考](/langgraphjs/cloud/reference/api/api_ref.html#tag/runsmanage)。

### 存储

存储是一个 API，用于管理可从任何 [线程](#threads) 访问的持久化[键值存储](./persistence.md#memory-store)。

存储对于在 LangGraph 应用程序中实现[记忆](./memory.md)很有用。

### Cron 作业

在许多情况下，按计划运行 assistant 很有用。

例如，假设你正在构建一个每天运行并发送当天新闻摘要电子邮件的 assistant。你可以使用 cron 作业每天在晚上 8:00 运行 assistant。

LangGraph Cloud 支持在用户定义的调度上运行的 cron 作业。用户指定调度、assistant 和一些输入。之后，在指定的调度上，服务器将：

- 使用指定的 assistant 创建新线程
- 将指定的输入发送到该线程

请注意，这每次都会将相同的输入发送到线程。有关创建 cron 作业的详细信息，请参阅[操作指南](/langgraphjs/cloud/how-tos/cron_jobs.md)。

LangGraph Cloud API 提供多个用于创建和管理 cron 作业的端点。有关更多详细信息，请参阅 [API 参考](/langgraphjs/cloud/reference/api/api_ref.html#tag/crons-enterprise-only)。

### Webhooks

Webhooks 使事件驱动的通信从你的 LangGraph Cloud 应用程序到外部服务成为可能。例如，你可能希望在调用 LangGraph Cloud 的 API 完成后向单独的服务发出更新。

许多 LangGraph Cloud 端点接受 `webhook` 参数。如果此参数由可以接受 POST 请求的端点指定，LangGraph Cloud 将在运行完成时发送请求。

有关更多详细信息，请参阅相应的[操作指南](/langgraphjs/cloud/how-tos/webhooks.md)。

## 相关

* LangGraph [应用程序结构](./application_structure.md)指南解释如何构建 LangGraph 应用程序以进行部署。
* [LangGraph Platform 的操作指南](../how-tos/index.md)。
* [LangGraph Cloud API 参考](/langgraphjs/cloud/reference/api/api_ref.html)提供有关 API 端点和数据模型的详细信息。
