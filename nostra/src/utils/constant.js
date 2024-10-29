export const actionList = [
  { id: "input", label: "📥 Input", type: "input" },
  { id: "twitter-data", label: "🐦 Twitter Data", type: "default" },
  { id: "defi-swap", label: "💱 DeFi Swap", type: "output" },
];

export const defaultAgents = [
  {
    id: "📊 Position Management Bot",
    label: "Position Management",
    name: "📊 Position Management Bot",
    type: "agent",
    description:
      "An intelligent assistant for managing and optimizing portfolio positions, providing suggestions and adjustment strategies.",
    prompt:
      "Please provide position management and adjustment suggestions based on current market dynamics.",
  },
  {
    id: "📈 Chart Analysis Bot",
    label: "Chart Analysis",
    name: "📈 Chart Analysis Bot",
    type: "agent",
    description:
      "A bot focused on technical analysis, providing insights and trend predictions based on market charts.",
    prompt:
      "Please analyze the current market chart and provide trend predictions and insights.",
  },
  {
    id: "🌐 Macro Analysis Bot",
    label: "Macro Analysis",
    name: "🌐 Macro Analysis Bot",
    type: "agent",
    description:
      "An assistant focused on macroeconomic and news analysis, offering insights for informed investment decisions.",
    prompt:
      "Please provide the latest macroeconomic data and relevant news analysis to support investment strategy.",
  },
];
