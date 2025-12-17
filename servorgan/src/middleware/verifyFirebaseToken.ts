// src/middleware/verifyFirebaseToken.ts
import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebaseAdmin";

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const header = (req.headers.authorization ?? "") as string;
  if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  const token = header.slice("Bearer ".length);
  try {
    const decoded = await auth.verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.error("Token verify failed:", err?.message ?? err);
    res.status(401).json({ error: "Invalid token" });
  }
}