# 如何添加自定义认证

!!! tip "先决条件"

    本指南假设你熟悉以下概念：

      *  [**认证与访问控制**](../../concepts/auth.md)
      *  [**LangGraph Platform**](../../concepts/index.md#langgraph-platform)

???+ note "按部署类型支持的特性"

    自定义认证支持所有 **托管 LangGraph Cloud** 中的部署，以及 **Enterprise** 自托管计划。它不支持 **Lite** 自托管计划。

本指南展示如何为你的 LangGraph Platform 应用添加自定义认证。本指南适用于 LangGraph Cloud、BYOC 和自托管部署。它不适用于在你自己的自定义服务器中独立使用 LangGraph 开源库的情况。

## 1. 实现认证

```typescript
import { Auth, HTTPException } from "@langchain/langgraph-sdk/auth";

export const auth = new Auth()
  .authenticate(async (request: Request) => {
    const authorization = request.headers.get("authorization");
    const token = authorization?.split(" ").at(-1);

    try {
      const userId = (await verifyToken(token)) as string;
      return userId;
    } catch (error) {
      throw new HTTPException(401, { message: "Invalid token", cause: error });
    }
  })
  .on("*", ({ value, user }) => {
    // Add owner to the resource metadata
    if ("metadata" in value) {
      value.metadata ??= {};
      value.metadata.owner = user.identity;
    }

    // Filter the resource by the owner
    return { owner: user.identity };
  })
  .on("store", ({ user, value }) => {
    if (value.namespace != null) {
      // Assuming you organize information in store like (user_id, resource_type, resource_id)
      const [userId, resourceType, resourceId] = value.namespace;
      if (userId !== user.identity) {
        throw new HTTPException(403, { message: "Not authorized" });
      }
    }
  });
```

## 2. 更新配置

在你的 `langgraph.json` 中，添加指向你的认证文件的路径：

```json hl_lines="7-9"
{
  "node_version": "20",
  "graphs": {
    "agent": "./agent.mts:graph"
  },
  "env": ".env",
  "auth": {
    "path": "./auth.mts:auth"
  }
}
```

## 3. 从客户端连接

在服务器上设置认证后，请求必须包含基于你选择的方案所需的授权信息。
假设你使用 JWT token 认证，你可以使用以下任一方法访问你的部署：

=== "Python Client"

    ```python
    from langgraph_sdk import get_client

    my_token = "your-token" # In practice, you would generate a signed token with your auth provider
    client = get_client(
        url="http://localhost:2024",
        headers={"Authorization": f"Bearer {my_token}"}
    )
    threads = await client.threads.search()
    ```

=== "Python RemoteGraph"

    ```python
    from langgraph.pregel.remote import RemoteGraph

    my_token = "your-token" # In practice, you would generate a signed token with your auth provider
    remote_graph = RemoteGraph(
        "agent",
        url="http://localhost:2024",
        headers={"Authorization": f"Bearer {my_token}"}
    )
    threads = await remote_graph.ainvoke(...)
    ```

=== "JavaScript Client"

    ```javascript
    import { Client } from "@langchain/langgraph-sdk";

    const my_token = "your-token"; // In practice, you would generate a signed token with your auth provider
    const client = new Client({
      apiUrl: "http://localhost:2024",
      headers: { Authorization: `Bearer ${my_token}` },
    });
    const threads = await client.threads.search();
    ```

=== "JavaScript RemoteGraph"

    ```javascript
    import { RemoteGraph } from "@langchain/langgraph/remote";

    const my_token = "your-token"; // In practice, you would generate a signed token with your auth provider
    const remoteGraph = new RemoteGraph({
      graphId: "agent",
      url: "http://localhost:2024",
      headers: { Authorization: `Bearer ${my_token}` },
    });
    const threads = await remoteGraph.invoke(...);
    ```

=== "CURL"

    ```bash
    curl -H "Authorization: Bearer ${your-token}" http://localhost:2024/threads
    ```

### 授权 Studio 用户

默认情况下，如果你在资源上添加了自定义授权，这也将适用于从 Studio 进行的交互。如果你愿意，你可以使用 [isStudioUser()](../../reference/functions/sdk_auth.isStudioUser.html) 以特殊方式处理已登录的 Studio 用户。

```typescript
import { Auth, isStudioUser } from "@langchain/langgraph-sdk/auth";

export const auth = new Auth().on("*", ({ value, user }) => {
  // If the request is made using LangSmith API-key auth
  if (isStudioUser(user)) {
    // E.g., allow all requests
    return {};
  }

  // Otherwise, apply regular authorization logic ...
  if ("metadata" in value) {
    value.metadata ??= {};
    value.metadata.owner = user.identity;
  }

  // Filter the resource by the owner
  return { owner: user.identity };
});
```

仅当你希望允许开发人员访问部署在托管 LangGraph Platform SaaS 上的图时，才使用此方法。
