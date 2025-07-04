// pages/api/generate.js
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Error parsing form:', err);
        return res.status(400).json({ error: 'Form parse error' });
      }

      const { topic, depth, days } = fields;
      let fileContent = '';

      // ✅ Read file content if file was uploaded
      if (files.file) {
        const file = files.file[0];
        const buffer = await fs.readFile(file.filepath, 'utf-8');
        fileContent = buffer.slice(0, 2000); // Limit size to ~2KB to avoid token overuse
      }

      if (!topic || !depth || !days) {
        return res.status(400).json({ error: 'Missing topic, depth, or days' });
      }

      // 🔥 Construct the prompt
      const prompt = `
You are an expert AI tutor. A student wants to learn the topic: "${topic}" with a ${depth} learning depth.
They want to complete the learning in ${days} days.

${fileContent ? `Here is additional context from the student:\n\n${fileContent}\n\nUse this to personalize the curriculum.\n` : ''}

For each of the ${days} days, create a lesson plan in this JSON format, with a minimum 5 mcqs:

[
  {
    "day": 1,
    "title": "Day Title",
    "explanation": "Teach the concept clearly and fully like a real tutor would. Write like you're tutoring a student who has no prior knowledge.",
    "resource": "Mention one relevant YouTube video or blog URL (keep it short and it should be working)",
    "mcqs": [
      {
        "question": "What is ...?",
        "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
        "answer": "b"
      }
    ]
  }
]

Respond ONLY with the complete JSON array. Do NOT include any commentary or code block formatting.
      `;

      // 🔥 Send prompt to Groq API
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

      if (!data.choices || !data.choices.length) {
        return res.status(500).json({ error: "No choices returned from Groq" });
      }

      const raw = data.choices[0].message.content;

      let curriculum;
      try {
        curriculum = JSON.parse(raw);
      } catch (err) {
        console.error("❌ JSON Parse error:", err);
        return res.status(500).json({ error: "Invalid response format from Groq" });
      }

      return res.status(200).json({ curriculum });
    });

  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
