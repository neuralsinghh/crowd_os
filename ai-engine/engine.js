// ai-engine/engine.js

function decideBestGate(crowdData) {
    // Sort gates by least load
    const sorted = [...crowdData].sort((a, b) => a.load - b.load);

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    const allHigh = crowdData.every(g => g.load > 0.7);

    let message = "";
    if (allHigh) {
        message = `Go to Gate ${best.gate}. Avoid Gate ${worst.gate} due to high congestion.\n⚠️ WARNING: All gates are highly congested. Expect delays.`;
    } else {
        message = `Go to Gate ${best.gate}. Avoid Gate ${worst.gate} due to high congestion.`;
    }

    return {
        bestGate: best.gate,
        avoidGate: worst.gate,
        message: message,
        confidence: "high"
    };
}

module.exports = { decideBestGate };