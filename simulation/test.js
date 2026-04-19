// simulation/test.js

console.log("🚀 Test file started...");

const { getCrowdData } = require("./sim");

setInterval(() => {
  console.clear();
  console.log("📊 Live Crowd Data:\n");
  console.log(getCrowdData());
}, 2000);

// console.log("HELLO TEST");