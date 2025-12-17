import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

import alertsRouter from "./routes/alerts";

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*").split(",");

// initial plugins
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

// app routes
app.use("/api/alerts", alertsRouter);

// testing endpoints
app.get("/health", (_req: Request, res: Response) =>
  res.json({ ok: true, service: "servorgan" })
);
app.get("/api/ping", (_req: Request, res: Response) => res.json({ pong: true }));
app.post("/api/echo", (req: Request, res: Response) =>
  res.json({ youSent: req.body ?? null })
);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`servorgan baseline API running on port ${PORT}`);
});

// export app for testing / future modularization
export default app;