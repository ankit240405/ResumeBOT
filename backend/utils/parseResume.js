import dotenv from "dotenv";
dotenv.config();

import pdf from "pdf-parse-fork";
import mammoth from "mammoth";
import textract from "textract";
import axios from "axios";

export async function extractText(buffer, mimetype) {
  try {
    if (mimetype === "application/pdf") {
      const data = await pdf(buffer);
      return data.text || "";
    }

    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    if (mimetype === "application/msword") {
      return new Promise((resolve, reject) => {
        textract.fromBufferWithMime(mimetype, buffer, (err, text) => {
          if (err) reject(err);
          else resolve(text || "");
        });
      });
    }

    throw new Error("Unsupported file type");
  } catch (err) {
    console.error("Resume Parse Error:", err);
    throw err;
  }
}

export async function analyzeResume(buffer, mimetype) {
  try {
    const text = await extractText(buffer, mimetype);

    if (!text.trim()) {
      throw new Error("No readable text extracted from resume");
    }

    const normalizedText = text.toLowerCase();

    const resumeIndicators = [
      "experience",
      "skills",
      "education",
      "projects",
      "internship",
      "work history",
      "technical skills",
      "tools",
      "technologies",
      "certifications",
      "extracurricular"
    ];

    let matchCount = 0;
    for (const keyword of resumeIndicators) {
      if (normalizedText.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount < 3) {
      throw new Error("Uploaded file does not appear to be a valid resume");
    }

     const prompt = `
You are a professional resume evaluation system modeled after
Enhancv, ResumeWorded, VMock, and top-tier ATS systems.

IMPORTANT:
Return ONLY a valid json object.
The response must be strict json and parseable by JSON.parse().
No markdown. No headings. No explanations.

===============================================================
SCORING SYSTEM
===============================================================

1. content_strength (0–100)
2. formatting_score (0–100)
3. writing_quality (0–100)
4. section_completeness (0–100)
5. role_alignment_score (0–100)
6. recruiter_interest_score (0–100)

hireability_score =
(content_strength * 0.35) +
(writing_quality * 0.20) +
(role_alignment_score * 0.20) +
(formatting_score * 0.15) +
(section_completeness * 0.10)

===============================================================
OUTPUT FORMAT (STRICT JSON)
===============================================================

{
  "content_strength": number,
  "formatting_score": number,
  "writing_quality": number,
  "section_completeness": number,
  "role_alignment_score": number,
  "recruiter_interest_score": number,
  "hireability_score": number,
  "strengths": [],
  "weaknesses": [],
  "role_fit": [],
  "improvement_suggestions": []
}

===============================================================
Analyze the following resume:
${text}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let output = response.data.choices[0].message.content;

    const start = output.indexOf("{");
    const end = output.lastIndexOf("}");
    const cleanJSON = output.slice(start, end + 1);

    return JSON.parse(cleanJSON);

  } catch (err) {
    console.error("ATS Error:", err);
    throw new Error("Failed to analyze resume");
  }
}