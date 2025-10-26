const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const HISTORY_FILE = path.join(__dirname, 'messages.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load existing messages
function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

// Save updated history
function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

let history = loadHistory();

// API endpoint to get message history
app.get('/history', (req, res) => {
  res.json(history);
});

// API endpoint to post a message (optional)
app.post('/message', (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: 'Invalid message' });

  const msg = { id: Date.now(), user, text, ts: new Date().toISOString() };
  history.push(msg);
  if (history.length > 500) history.shift();
  saveHistory(history);

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: 'message', payload: msg }));
  });

  res.json({ ok: true });
});

// Start HTTP + WebSocket server
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'history', payload: history }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'message') {
        const chat = {
          id: Date.now(),
          user: msg.payload.user,
          text: msg.payload.text,
          ts: new Date().toISOString(),
        };
        history.push(chat);
        saveHistory(history);
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN)
            client.send(JSON.stringify({ type: 'message', payload: chat }));
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});
