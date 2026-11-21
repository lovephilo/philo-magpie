# Philo for Magpie

将 Philo 接入 Magpie 网关的本地 agent 插件。Magpie 管理模型入口，插件将网关地址、访问密钥和模型列表转换为 Philo 的连接配置；它不包含或安装 Philo 本体。

## 安装与使用

1. 先安装 Philo，并确保 `philo` 命令在运行 Magpie 的环境中可用。
2. 执行 `magpie plugin add github:lovephilo/philo-magpie` 从本仓库安装插件。此前通过本地文件夹安装的用户，请先在 Magpie 的插件管理中移除旧条目。
3. 在 Magpie 中配置模型提供商，然后在 Agents 页为 Philo 选择默认模型并连接。保持 Magpie 网关运行。
4. 如需为默认模型指定默认思考深度，可直接编辑 `~/.philo/magpie.json` 在顶层添加或修改 `"effort"`（如 `"high"`），Magpie 切换模型或刷新密钥时不会覆盖该字段。Philo 热加载后立即应用于新会话和未锁定的已有会话，已接受的任务保持原有配置。

这是私有的本地集成包，不应通过 `npm install magpie-philo` 从公共 registry 安装。

## MCP 和 Skills

在 Magpie 的 Library 中把 MCP 服务或技能分配给 Philo。包含此功能的 Philo 构建会自动接入分配结果，使用任意模型的会话均可调用。

- **MCP** 支持逐个直连，也支持 Magpie 的 MCP 路由。开启路由时，标为直连的服务可以同时使用。Magpie 通过 `~/.philo/magpie-mcp.json` 同步配置，Philo 会刷新分配来的工具。
- **Skills** 通过 `~/.philo/skills` 同步。开启 Skill 路由时，Philo 向模型提供 `magpie-skills` 索引，也可以用 `@` 按名字选中技能。

如果使用自定义 `PHILO_HOME`，可以在 Philo 的 `magpie` 插件设置中用 `mcpPath` 指向实际导出文件。MCP 导出文件可能包含服务凭据，请保存在本机。

## 配置与数据

- 插件和 agent 均显示为 Philo。修改名称或图标时，请同步更新 `package.json` 的 `magpie` 字段和 `agent.js` 的 `agent` 对象。Magpie 的 agent 加载器不支持直接导入 JSON。
- 插件入口：`./agent.js`，由 `package.json` 的 `magpie.agent` 声明。
- Philo 从 `~/.philo/magpie.json` 的顶层读取会话默认值：`model` 由 Magpie 写入，`effort` 可手动配置为默认思考深度（如 `"high"`）；删除或留空 `effort` 会恢复 Philo 自身默认。
- 连接参数：`baseUrl` 来自 Magpie 网关的 `v1` 地址，`apiKey` 来自网关密钥，API 类型为 `openai-completions`。
- `models[].efforts` 列出各模型支持的思考深度。插件未开启 Magpie 的网关级 `effort: true`，避免网关覆盖 Philo 会话内自选的思考深度。
- 技能目录：`~/.philo/skills`。

连接配置包含网关访问密钥。不要将该配置提交到版本库或直接粘贴到日志、截图和问题报告中。

## 在 Magpie 查看对话

使用包含会话标识修复的 Philo 构建，并重启 Philo 的运行进程。通过 Magpie 发出的模型请求会以 `User-Agent: philo` 和 `X-Magpie-Session`（Philo 的真实会话 ID）归组，在 Magpie 对话页的网关会话中显示。仅更新此插件目录不会更新正在运行的 Philo 二进制。

要查看消息正文，需在 Magpie 对话页主动开启“网关对话录制”。录制默认关闭，会保存经过网关的提示词、回复和工具结果，可能包含私人代码；只在本机保留，最多 7 天、256 MiB。插件不会自动开启录制。

此集成不是本地历史导入：未经过 Magpie 的会话、旧的无会话 ID 请求，以及未录制或已过期的正文，无法由网关补回。修复后可在已有 Philo 会话里再发一条消息验证，无需删除原有会话。

## 排查

- **详情提示 “no README … beside its package.json”**：确认添加的是本插件目录，且其中存在此 `README.md`。若使用了复制的目录，也要同步 README，再重新打开详情。
- **找不到 Philo**：检查 Magpie 所在环境的 PATH 是否可以找到 `philo`；添加插件不会安装该命令。
- **没有可选模型或连接失败**：检查 Magpie 的提供商、模型列表和网关状态。README 能正常显示并不代表模型连接成功。

## 维护与验证

Magpie 的 `/api/plugins/page` 调用 `plugin.Readme`：本地路径和已安装的 git 插件从目标目录读取 README，不向父目录查找，也不用 `package.json` 的 `description` 代替正文。文件名大小写不敏感，优先顺序为 `README.md`、`README.markdown`、`README.txt`、`README`；正文最多读取 200 KiB，更新时间来自文件修改时间。

`description` 是包的简短介绍，`magpie.agent` 是加载入口，`magpie.icon` 是图标，均不能替代此文档。保留本地包的 `private: true`，不为修复详情页添加虚构的发布者或公共发布信息。

Magpie 自身的 README 读取契约可在其目录验证：

```sh
cd /path/to/magpie
GOWORK=off go test ./internal/plugin -run '^TestReadmeFromFolder$' -count=1
```

此检查不启动 Philo、不连接模型，也不修改用户配置。
