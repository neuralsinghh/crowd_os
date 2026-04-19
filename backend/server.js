// backend/server.js

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { runAgent } = require("../ai-engine/agent");
const { getAIDecision } = require("../ai-engine/gemini");
const { triggerRush, getCrowdData } = require("../simulation/sim");

const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// ==========================================
// 🏃 RUSH ENDPOINT
// ==========================================
app.post("/api/rush/:gateId", (req, res) => {
    const { gateId } = req.params;

    const success = triggerRush(gateId.toUpperCase());

    if (success) {
        return res.json({
            success: true,
            message: `Rush triggered at Gate ${gateId.toUpperCase()}`
        });
    }

    return res.status(400).json({
        success: false,
        message: "Invalid Gate ID"
    });
});

// ==========================================
// 📈 HISTORY ENDPOINT
// ==========================================
app.get("/api/history", (req, res) => {
    try {
        const rows = db
            .prepare(`SELECT * FROM crowd_history ORDER BY id DESC LIMIT 20`)
            .all();

        res.json({ history: rows.reverse() });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 🚀 DECISION API
// ==========================================
app.get("/api/decision", async (req, res) => {

    try {
        let observation;

        // 🧠 Try agent first
        try {
            const agentResult = await runAgent();
            observation = agentResult.observation;
        } catch (err) {
            console.warn("⚠️ Agent failed → simulation fallback");
            observation = getCrowdData();
        }

        // 🤖 Try Gemini
        let aiText = null;
        try {
            aiText = await getAIDecision(observation);
        } catch (err) {
            console.warn("⚠️ Gemini failed:", err.message);
        }

        return res.json({
            timestamp: Date.now(),
            source: aiText ? "agent + gemini" : "simulation",
            crowd: observation,
            decision: aiText || "AI Suggestion: Choose the least congested gate."
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
});

// ==========================================
// 🧪 HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
    res.send("🚀 CrowdOS Server Running");
});

// ==========================================
// 🔌 WEBSOCKET
// ==========================================
io.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected");
    });
});

// ==========================================
// 🔄 REAL-TIME LOOP (IMPROVED)
// ==========================================
setInterval(async () => {

    try {
        let observation;

        // 🧠 Agent
        try {
            const agentResult = await runAgent();
            observation = agentResult.observation;
        } catch {
            observation = getCrowdData();
        }

        // 🤖 Gemini
        let aiText = null;
        try {
            aiText = await getAIDecision(observation);
        } catch {
            // silent fail (avoid spam)
        }

        const payload = {
            timestamp: Date.now(),
            source: aiText ? "agent + gemini" : "simulation",
            crowd: observation,
            decision: aiText || "AI Suggestion: Choose the least congested gate."
        };

        io.emit("crowd_update", payload);

    } catch (err) {
        console.error("❌ Loop Error:", err.message);
    }

}, 2000);

// ==========================================
// 🚀 START SERVER
// ==========================================
server.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
});