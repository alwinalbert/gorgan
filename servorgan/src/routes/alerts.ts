// src/routes/alerts.ts
import { Router } from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const snap = await db.collection("alerts").orderBy("createdAt", "desc").limit(limit).get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.threatLevel) return res.status(400).json({ error: "threatLevel required" });
    const doc = {
      ...body,
      userId: (req as any).user?.uid,
      createdAt: body.createdAt ?? Date.now(),
    };
    const ref = await db.collection("alerts").add(doc);
    const saved = { id: ref.id, ...doc };
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create alert" });
  }
});

export default router;