import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const getTokenData = async (coin) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/tickers?exchange_ids=binance&include_exchange_logo=false&order=volume_desc&depth=false`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-cg-demo-api-key": process.env.COIN_API,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const getChartData = async (coin) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-cg-demo-api-key": process.env.COIN_API,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const imageUrl = req.body.imageUrl;
    const promptMessage = req.body.prompt;
    const messages = req.body.message;
    const agentLabel = req.body.agentLabel;
    console.log("agentLabel", agentLabel);
    const token = req.body.token;
    // Check for null or undefined values
    if (!promptMessage || !messages) {
      res.status(400).json({ error: "Prompt or message content is missing." });
      return;
    }

    try {
      const presetPrompt = `
      In very short sentence analysis the requirements and give out an buy or sell ratio in the end`;
      let extendedMessages = [
        { role: "system", content: promptMessage + presetPrompt },
        { role: "user", content: messages },
      ];

      let data = null;
      if (agentLabel === "📊 Pricing Analysis Bot agent") {
        data = await getTokenData(token);
        console.log(data)
      } else if (agentLabel === "📈 Chart Analysis Bot agent") {
        data = await getChartData(token);
        console.log(data)
      }

      // Ensure imageUrl is handled properly if present
      if (imageUrl) {
        extendedMessages.push({
          role: "user",
          content: `Image URL: ${imageUrl}`,
        });
      }

      if (data) {
        extendedMessages.push({
          role: "user",
          content: JSON.stringify(data),
        });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: extendedMessages,
      });

      const responseMessage = completion.choices[0].message.content;
      res.status(200).json({ message: responseMessage });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({ error: "Failed to connect to OpenAI API" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
