source env.sh
# Check if the WASM file exists
if [ ! -f "out/main.wasm" ]; then
    echo "Error: out/main.wasm not found. Make sure you've built the contract."
    exit 1
fi
near deploy --wasmFile out/main.wasm --accountId $CONTRACT
# https://explorer.testnet.near.org/transactions/5aGrRr3HLcP5xtXxNt2KYg7KWbd5afgBNTvdgHnpYV63
# INIT
near call $CONTRACT new --accountId $CONTRACT
near call $CONTRACT add_agent "$(cat news.json)" --accountId $CONTRACT
# https://explorer.testnet.near.org/transactions/5iNrUU1eFhKpkjkzvBvTNYZmTycv4QrTMtKBit7znqW4
# https://explorer.mainnet.near.org/transactions/G5q2L5pJ2k4dvJia3GXPcyzknkh9sqPuHKLiJ3ka2gn9
near view $CONTRACT get_agents
# View call: nosta-test.prelaunch.testnet.get_agents()
# [
#   {
#     name: '📰 Crypto News Analyst',
#     description: 'An AI agent specialized in analyzing cryptocurrency market trends through news analysis',
#     prompt: 'You are a cryptocurrency market analyst specializing in news analysis. Your task is to analyze the latest crypto news and identify potential market trends. For each piece of news:\n' +
#       '\n' +
#       '1. Identify key events, announcements, or developments\n' +
#       '2. Analyze potential market impact (positive/negative/neutral)\n' +
#       '3. Consider both short-term and long-term implications\n' +
#       '4. Look for correlations with historical events\n' +
#       '5. Evaluate credibility and significance of news sources\n' +
#       '6. Consider broader market context and sentiment\n' +
#       '\n' +
#       'Provide clear, concise analysis with supporting evidence and reasoning. Focus on actionable insights while acknowledging uncertainties. Maintain objectivity and avoid speculation.'
#   }
# ]
