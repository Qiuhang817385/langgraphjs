# LangGraph SDK

!!! info "先决条件"
    - [LangGraph Platform](./langgraph_platform.md)
    - [LangGraph Server](./langgraph_server.md)

LangGraph Platform 提供 Python 和 JS SDK 用于与 [LangGraph Server API](./langgraph_server.md) 交互。

## 安装

你可以使用适合你的语言的适当包管理器安装包。

=== "Python"
    ```bash
    pip install langgraph-sdk
    ```

=== "JS"
    ```bash
    yarn add @langchain/langgraph-sdk
    ```


## API 参考

你可以在此处找到 SDK 的 API 参考：

- [Python SDK 参考](/langgraphjs/cloud/reference/sdk/python_sdk_ref/)
- [JS/TS SDK 参考](/langgraphjs/cloud/reference/sdk/js_ts_sdk_ref/)

## Python 同步 vs 异步

Python SDK 提供同步 (`get_sync_client`) 和异步 (`get_client`) 客户端，用于与 LangGraph Server API 交互。

=== "异步"
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=..., api_key=...)
    await client.assistants.search()
    ```

=== "同步"

    ```python
    from langgraph_sdk import get_sync_client

    client = get_sync_client(url=..., api_key=...)
    client.assistants.search()
    ```

## 相关

- [LangGraph CLI API 参考](/langgraphjs/cloud/reference/cli/)
- [Python SDK 参考](/langgraphjs/cloud/reference/sdk/python_sdk_ref/)
- [JS/TS SDK 参考](/langgraphjs/cloud/reference/sdk/js_ts_sdk_ref/)
