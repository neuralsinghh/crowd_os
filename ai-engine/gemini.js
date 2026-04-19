// ai-engine/gemini.js

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function getAIDecision(crowdData) {
    // Step 4 edge cases and formatted output logic
    const prompt = `
You are CrowdOS Agent — an intelligent real-time crowd management AI system.

Your goal is to optimize crowd movement across multiple gates in a venue.

Here is the real-time crowd data for all gates:
${JSON.stringify(crowdData, null, 2)}

INSTRUCTIONS:

Step 1 — Observe: Understand current crowd distribution from the data.
Step 2 — Analyze:
- High load > 0.85
- Moderate load 0.6–0.85
- Low load < 0.6
Step 3 — Decide: Select the best gate (least congestion) and the gate to avoid (highest congestion).
Step 4 — Handle edge cases: If ALL gates are highly congested (>0.85), recommend the least congested gate AND warn the user about delays.

Respond EXACTLY in this format:

Thought:
[Briefly explain how you analyzed the situation]

Action:
[Give a clear instruction like: "Go to Gate A. Avoid Gate D due to high congestion." Also include a delay warning if all are congested.]
`;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
            process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        // Check if there's an error gracefully instead of spamming giant JSONs
        if (data.error) {
            console.log(`❌ Gemini Error: [${data.error.code}] ${data.error.status} - Falling back to local agent.`);
            return null;
        }

        // ✅ Safe extraction
        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            console.log("✅ Gemini successfully returned a decision.");
            return data.candidates[0].content.parts[0].text;
        } else {
            console.log("⚠️ Gemini didn't return a valid candidate - Falling back to local agent.");
            return null;
        }
    } catch (error) {
        console.log("❌ Gemini Fetch Error:", error.message);
        return null;
    }
}

module.exports = { getAIDecision };