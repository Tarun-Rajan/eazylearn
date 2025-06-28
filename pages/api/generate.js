
export default async function handler(req, res) {
  const { topic, depth, days } = req.body;

  if (!topic || !depth || !days) {
    console.log("❌ Missing topic, depth or days:", { topic, depth, days });
    return res.status(400).json({ error: "Topic, depth, or days missing" });
  }

  const prompt = `
You are an expert AI tutor. A student wants to learn the topic: "${topic}" with a ${depth} learning depth.
They want to complete the learning in ${days} days.

For each of the ${days} days, create a lesson plan in this JSON format:

[
  {
    "day": 1,
    "title": "Day Title",
    "explanation": "Teach the concept clearly and fully like a real tutor would. Write like you're tutoring a student who has no prior knowledge.",
    "resource": "Mention one relevant YouTube video or blog URL (keep it short)",
    "mcqs": [
      {
        "question": "What is ...?",
        "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
        "answer": "b"
      },
      ...
      // At least 5 MCQs
    ]
  },
  ...
]

Respond ONLY with the complete JSON array. Do NOT include any commentary or code block formatting.
  `;

  try {
    console.log("📤 Sending prompt to Groq...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("📥 Groq raw response:", data);

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ error: "No choices returned from Groq" });
    }

    const raw = data.choices[0].message.content;

    let curriculum;
    try {
      curriculum = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Failed to parse AI response as JSON:", err);
      return res.status(500).json({ error: "Invalid response format from Groq" });
    }

    return res.status(200).json({ curriculum });

  } catch (err) {
    console.error("🔥 API error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
