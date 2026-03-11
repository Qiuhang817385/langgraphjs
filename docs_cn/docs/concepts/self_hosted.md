# 自托管

!!! note 先决条件

    - [LangGraph Platform](./langgraph_platform.md)
    - [部署选项](./deployment_options.md)

## 版本

自托管部署有两个版本：[自托管企业版](./deployment_options.md#self-hosted-enterprise) 和 [自托管精简版](./deployment_options.md#self-hosted-lite)。

### 自托管精简版

自托管精简版是 LangGraph Platform 的有限版本，你可以在本地或以自托管方式运行（最多执行 100 万个节点）。

使用自托管精简版时，你使用 [LangSmith](https://smith.langchain.com/) API 密钥进行身份验证。

### 自托管企业版

自托管企业版是 LangGraph Platform 的完整版本。

要使用自托管企业版，你必须获取在运行 Docker 镜像时需要传递的许可证密钥。要获取许可证密钥，[联系我们的销售团队](https://www.langchain.com/contact-sales)。

## 要求

- 你使用 `langgraph-cli` 和/或 [LangGraph Studio](./langgraph_studio.md) 应用程序在本地测试图。
- 你使用 `langgraph build` 命令构建镜像。

## 工作原理

- 在你自己的基础设施上部署 Redis 和 Postgres 实例。
- 使用 [LangGraph CLI](./langgraph_cli.md) 为 [LangGraph Server](./langgraph_server.md) 构建 docker 镜像
- 部署一个将运行 docker 镜像并传入必要环境变量的 Web 服务器。

请参阅[操作指南](../how-tos/deploy-self-hosted.md)
