# 快速入门：启动本地 LangGraph Server

这是一个快速入门指南，帮助你在本地启动并运行 LangGraph 应用程序。

## 安装 LangGraph CLI

```bash
$ npx @langchain/langgraph-cli@latest

# 或全局安装，将可用作 `langgraphjs`
$ npm install -g @langchain/langgraph-cli
```

## 🌱 创建 LangGraph 应用程序

创建一个新应用程序并按照说明操作，选择 `ReAct Agent` 作为模板。这是一个简单的代理，可以灵活地扩展到许多工具。

```shell
$ npm create langgraph
```

## 安装依赖

在你新创建的 LangGraph 应用程序的根目录中，以 `edit` 模式安装依赖，以便服务器使用你的本地更改：

```shell
$ yarn
```

## 创建 `.env` 文件

你会在新创建的 LangGraph 应用程序的根目录中找到一个 `.env.example`。在你的新 LangGraph 应用程序的根目录中创建一个 `.env` 文件，并将 `.env.example` 文件的内容复制到其中，填写必要的 API 密钥：

```bash
LANGSMITH_API_KEY=lsv2...
TAVILY_API_KEY=tvly-...
ANTHROPIC_API_KEY=sk-
OPENAI_API_KEY=sk-...
```

??? note "获取 API 密钥"

    - **LANGSMITH_API_KEY**：前往 [LangSmith 设置页面](https://smith.langchain.com/settings)。然后点击 **Create API Key**。
    - **ANTHROPIC_API_KEY**：从 [Anthropic](https://console.anthropic.com/) 获取 API 密钥。
    - **OPENAI_API_KEY**：从 [OpenAI](https://openai.com/) 获取 API 密钥。
    - **TAVILY_API_KEY**：在 [Tavily 网站](https://app.tavily.com/) 上获取 API 密钥。

## 🚀 启动 LangGraph Server

```shell
$ npx @langchain/langgraph-cli@latest dev
```

这将启动本地的 LangGraph API 服务器。如果运行成功，你应该会看到类似以下内容：

>    - 🚀 API: http://localhost:2024
>    - 🎨 Studio UI: https://smith.langchain.com/studio?baseUrl=http://localhost:2024


!!! note "内存模式"

    `langgraphjs dev` 命令以内存模式启动 LangGraph Server。此模式适用于开发和测试目的。对于生产用途，你应该部署具有持久存储后端访问权限的 LangGraph Cloud。

    如果你想使用持久存储后端测试你的应用程序，可以使用 `langgraphjs up` 命令代替 `langgraphjs dev`。你需要在机器上安装 `docker` 才能使用此命令。

## LangGraph Studio Web UI

LangGraph Studio Web 是一个专门的 UI，你可以连接到 LangGraph API 服务器，以在本地实现应用程序的可视化、交互和调试。通过访问 `langgraph dev` 命令输出中提供的 URL，在 LangGraph Studio Web UI 中测试你的图。

>    - LangGraph Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://localhost:2024

!!! info "连接到具有自定义主机/端口的服务器"

    如果你使用自定义主机/端口运行 LangGraph API 服务器，你可以通过更改 `baseUrl` URL 参数将 Studio Web UI 指向它。例如，如果你在端口 8000 上运行服务器，可以将上述 URL 更改为以下内容：

    ```
    https://smith.langchain.com/studio/baseUrl=http://localhost:8000
    ```


!!! warning "Safari 兼容性"
    
    目前，LangGraph Studio Web 在本地运行服务器时不支持 Safari。

## 测试 API

=== "Python SDK (Async)"

    **安装 LangGraph Python SDK**

    ```shell
    $ pip install langgraph-sdk
    ```

    **发送消息给助手（无线程运行）**

    ```python
    from langgraph_sdk import get_client

    client = get_client(url="http://localhost:2024")

    async for chunk in client.runs.stream(
        None,  # 无线程运行
        "agent", # 助手名称。在 langgraph.json 中定义。
        input={
            "messages": [{
                "role": "human",
                "content": "What is LangGraph?",
            }],
        },
        stream_mode="updates",
    ):
        print(f"Receiving new event of type: {chunk.event}...")
        print(chunk.data)
        print("\n\n")
    ```

=== "Python SDK (Sync)"

    **安装 LangGraph Python SDK**

    ```shell
    $ pip install langgraph-sdk
    ```

    **发送消息给助手（无线程运行）**

    ```python
    from langgraph_sdk import get_sync_client

    client = get_sync_client(url="http://localhost:2024")

    for chunk in client.runs.stream(
        None,  # 无线程运行
        "agent", # 助手名称。在 langgraph.json 中定义。
        input={
            "messages": [{
                "role": "human",
                "content": "What is LangGraph?",
            }],
        },
        stream_mode="updates",
    ):
        print(f"Receiving new event of type: {chunk.event}...")
        print(chunk.data)
        print("\n\n")
    ```

=== "Javascript SDK"

    **安装 LangGraph JS SDK**

    ```shell
    $ yarn add @langchain/langgraph-sdk
    ```

    **发送消息给助手（无线程运行）**

    ```js
    const { Client } = await import("@langchain/langgraph-sdk");

    // 只有在调用 langgraph dev 时更改了默认端口才设置 apiUrl
    const client = new Client({ apiUrl: "http://localhost:2024"});

    const streamResponse = client.runs.stream(
        null, // 无线程运行
        "agent", // 助手 ID
        {
            input: {
                "messages": [
                    { "role": "user", "content": "What is LangGraph?"}
                ]
            },
            streamMode: "messages",
        }
    );

    for await (const chunk of streamResponse) {
        console.log(`Receiving new event of type: ${chunk.event}...`);
        console.log(JSON.stringify(chunk.data));
        console.log("\n\n");
    }
    ```

=== "Rest API"

    ```bash
    curl -s --request POST \
        --url "http://localhost:2024/runs/stream" \
        --header 'Content-Type: application/json' \
        --data "{
            \"assistant_id\": \"agent\",
            \"input\": {
                \"messages\": [
                    {
                        \"role\": \"human\",
                        \"content\": \"What is LangGraph?\"
                    }
                ]
            },
            \"stream_mode\": \"updates\"
        }" 
    ```

!!! tip "认证"

    如果你要连接到远程服务器，你需要提供 LangSmith
    API 密钥进行授权。有关客户端的更多信息，请参阅 API 参考。

## 下一步

现在你已经运行了一个本地的 LangGraph 应用程序，通过探索部署和高级功能来继续你的旅程：

### 🌐 部署到 LangGraph Cloud

- **[LangGraph Cloud 快速入门](../../cloud/quick_start.md)**：使用 LangGraph Cloud 部署你的 LangGraph 应用程序。

### 📚 了解更多关于 LangGraph Platform

通过以下资源扩展你的知识：

- **[LangGraph Platform 概念](../../concepts/index.md#langgraph-platform)**：了解 LangGraph Platform 的基础概念。
- **[LangGraph Platform 操作指南](../../how-tos/index.md#langgraph-platform)**：发现构建和部署应用程序的分步指南。

### 🛠️ 开发者参考

访问开发和 API 使用的详细文档：

- **[LangGraph Server API 参考](../../cloud/reference/api/api_ref.html)**：探索 LangGraph Server API 文档。
- **[Python SDK 参考](../../cloud/reference/sdk/python_sdk_ref.md)**：探索 Python SDK API 参考。
- **[JS/TS SDK 参考](../../cloud/reference/sdk/js_ts_sdk_ref.md)**：探索 JS/TS SDK API 参考。
