export const agent = {
  id: "philo",
  name: "Philo",
  icon: "https://philo.love/philo.svg",
  bin: "philo",
  config: "~/.philo/magpie.json",
  format: "json",
  model: "model",
  ua: ["philo"],
  library: {
    skills: "~/.philo/skills",
    mcp: "~/.philo/magpie-mcp.json",
    mcpFormat: "claude",
  },
  notice: "跟随默认模型的会话会自动更新，新任务使用更新后的配置。",
}

export function connect({ gateway, models }) {
  const list = []
  for (const model of models || []) {
    if (!model || !model.id) continue
    list.push({
      id: model.id,
      name: model.name || model.id,
      context: model.context || 0,
      output: model.output || 0,
      images: !!model.images,
      efforts: model.efforts || [],
    })
  }
  return {
    baseUrl: gateway.v1,
    apiKey: gateway.key,
    api: "openai-completions",
    models: list,
  }
}
