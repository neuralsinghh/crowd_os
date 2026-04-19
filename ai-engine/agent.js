const { getCrowdData } = require("../simulation/sim");
const { decideBestGate } = require("./engine");

async function runAgent() {
    const data = getCrowdData();

    console.log("🧠 Agent thinking...");

    // Step 1: Observe
    const observation = data;

    // Step 2: Decide
    const decision = decideBestGate(observation);

    // Step 3: Act
    return {
        observation,
        action: decision.message,
    };
}

module.exports = { runAgent };