export default function handler(req, res) {
  if (req.method === "GET") {
    console.log(process.env.OPEN_AI_API_KEY);
    res.status(200).json({ message: "Hello, Next.js API!" });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
