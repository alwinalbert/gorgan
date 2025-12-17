import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { auth } from "./config/firebaseAdmin";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/users";
import alertRoutes from "./routes/alerts";

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*").split(",");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})



// initial plugins
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

const onlineUsers = new Map<string, string>(); 
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error("Missing token");

    const decoded = await auth.verifyIdToken(token);
    socket.data.uid = decoded.uid; // 👈 use socket.data
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const uid = socket.data.uid;
  onlineUsers.set(uid, socket.id);

  socket.on("disconnect", () => {
    onlineUsers.delete(uid);
  });
});

// app routes
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);

// testing endpoints
app.get("/health", (_req: Request, res: Response) =>
  res.json({ ok: true, service: "servorgan" })
);
app.get("/api/ping", (_req: Request, res: Response) => res.json({ pong: true }));
app.post("/api/echo", (req: Request, res: Response) =>
  res.json({ youSent: req.body ?? null })
);

const PORT = Number(process.env.PORT ?? 4000);
httpServer.listen(PORT, () => {
  console.log(`servorgan baseline API running on port ${PORT}`);
});

// export app for testing / future modularization
export default app;