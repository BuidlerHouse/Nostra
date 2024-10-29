import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const imageUrl = req.body.imageUrl;
    const promptMessage = req.body.prompt;
    const messages = req.body.message;

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

      // Ensure imageUrl is handled properly if present
      if (imageUrl) {
        extendedMessages.push({
          role: "user",
          content: `Image URL: ${imageUrl}`,
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
