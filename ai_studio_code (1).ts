import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

interface Greeting {
  id: string;
  name: string;
  message: string;
  timestamp: number;
}

const greetings: Greeting[] = [];

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.get("/api/greetings", (req, res) => {
    res.json(greetings);
  });

  app.post("/api/greetings", (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }
    const newGreeting: Greeting = {
      id: Math.random().toString(36).substring(7),
      name,
      message,
      timestamp: Date.now(),
    };
    greetings.unshift(newGreeting);
    if (greetings.length > 50) greetings.pop();

    const payload = JSON.stringify({ type: "GREETING_ADDED", data: newGreeting });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.status(201).json(newGreeting);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();