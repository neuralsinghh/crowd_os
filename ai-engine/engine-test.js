// ai-engine/test.js

const { getCrowdData } = require("../simulation/sim");
const { decideBestGate } = require("./engine");

const data = getCrowdData();
const decision = decideBestGate(data);

console.log("📊 Crowd Data:\n", data);
console.log("\n🤖 AI Decision:\n", decision);