// ==============================
// Real-Time Chat Server (Render Ready)
// ==============================
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simple root route (helps Render show "Live" status)
app.get("/", (req, res) => {
  res.send("✅ Chat WebSocket Server is running!");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("🟢 Client connected");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());
    // Broadcast to all clients
    for (const client of clients) {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on("close", () => {
    console.log("🔴 Client disconnected");
    clients = clients.filter((c) => c !== ws);
  });
});

// 💤 Keep server alive (Render will ping this route)
setInterval(() => {
  fetch(`https://${process.env.RENDER_EXTERNAL_HOSTNAME || "localhost"}/`)
    .then(() => console.log("💤 Keep-alive ping sent"))
    .catch(() => {});
}, 14 * 60 * 1000); // every 14 minutes

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
