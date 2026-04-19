// ai-engine/gemini-test.js

const { getCrowdData } = require("../simulation/sim");
const { getAIDecision } = require("./gemini");
const { decideBestGate } = require("./engine");

async function run() {
    const data = getCrowdData();

    console.log("📊 Crowd Data:\n", data);

    // 🔥 Try Gemini
    const aiText = await getAIDecision(data);

    if (aiText) {
        console.log("\n🤖 Gemini Decision:\n");
        console.log(aiText);
    } else {
        // 💡 FALLBACK (VERY IMPORTANT FOR JUDGES)
        const localDecision = decideBestGate(data);

        console.log("\n⚠️ Gemini failed, using fallback AI:\n");
        console.log(localDecision.message);
    }
}

run();