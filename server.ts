import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

app.use(express.json());
const greetings: any[] = [];

app.get("/api/greetings", (req, res) => res.json(greetings));
app.post("/api/greetings", (req, res) => {
  const greeting = { ...req.body, id: Date.now().toString(), timestamp: Date.now() };
  greetings.unshift(greeting);
  wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: "GREETING_ADDED", data: greeting })));
  res.status(201).json(greeting);
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
    else {
    app.use(express.static(path.resolve("dist/public")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/public/index.html"));
     });
    }
  
  server.listen(PORT, "0.0.0.0", () => { console.log(`Server at http://localhost:${PORT}`)); }
}
start();
