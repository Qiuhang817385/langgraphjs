# 部署选项

!!! info "先决条件"

    - [LangGraph Platform](./langgraph_platform.md)
    - [LangGraph Server](./langgraph_server.md)
    - [LangGraph Platform 计划](./plans.md)

## 概述

使用 LangGraph Platform 进行部署有 4 个主要选项：

1. **[自托管精简版](#self-hosted-lite)**：适用于所有计划。

2. **[自托管企业版](#self-hosted-enterprise)**：仅适用于**企业版**计划。

3. **[云 SaaS](#cloud-saas)**：适用于**增强版**和**企业版**计划。

4. **[自带云](#bring-your-own-cloud)**：仅适用于**企业版**计划，且**仅在 AWS 上**。

请参阅 [LangGraph Platform 计划](./plans.md) 了解有关不同计划的更多信息。

下面的指南将解释部署选项之间的差异。

## 自托管企业版

!!! important

    自托管企业版仅适用于**企业版**计划。

使用自托管企业版部署，你负责管理基础设施，包括设置和维护所需的数据库和 Redis 实例。

你将使用 [LangGraph CLI](./langgraph_cli.md) 构建 Docker 镜像，然后可以将其部署在你自己的基础设施上。

有关更多信息，请参阅：

* [自托管概念指南](./self_hosted.md)
* [自托管部署操作指南](../how-tos/deploy-self-hosted.md)

## 自托管精简版

!!! important

    自托管精简版适用于所有计划。

自托管精简版部署选项是 LangGraph Platform 的免费（最多执行 100 万个节点）、有限版本，你可以在本地或以自托管方式运行。

使用自托管精简版部署，你负责管理基础设施，包括设置和维护所需的数据库和 Redis 实例。

你将使用 [LangGraph CLI](./langgraph_cli.md) 构建 Docker 镜像，然后可以将其部署在你自己的基础设施上。


有关更多信息，请参阅：

* [自托管概念指南](./self_hosted.md)
* [自托管部署操作指南](https://langchain-ai.github.io/langgraphjs/how-tos/deploy-self-hosted/)

## 云 SaaS

!!! important

    LangGraph Platform 的云 SaaS 版本仅适用于**增强版**和**企业版**计划。

LangGraph Platform 的 [云 SaaS](./langgraph_cloud.md) 版本作为 [LangSmith](https://smith.langchain.com/) 的一部分托管。

LangGraph Platform 的云 SaaS 版本提供了一种简单的方法来部署和管理你的 LangGraph 应用程序。

此部署选项提供与 GitHub 的集成，允许你从 GitHub 上的任何仓库部署代码。

有关更多信息，请参阅：

* [云 SaaS 概念指南](./langgraph_cloud.md)
* [如何部署到云 SaaS](/langgraphjs/cloud/deployment/cloud.md)

## 自带云

!!! important

    LangGraph Platform 的自带云版本仅适用于**企业版**计划。

这结合了云和自托管的最佳优势。我们管理基础设施，所以你不必管理，但所有基础设施都在你的云中运行。目前仅在 AWS 上可用。

有关更多信息，请参阅：

* [自带云概念指南](./bring_your_own_cloud.md)

## 相关

有关更多信息，请参阅：

* [LangGraph Platform 计划](./plans.md)
* [LangGraph Platform 定价](https://www.langchain.com/langgraph-platform-pricing)
* [部署操作指南](../how-tos/index.md#deployment)
