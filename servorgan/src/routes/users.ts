import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { db, admin } from "../config/firebaseAdmin";
import {
  createUserIfNotExists,
  getUser,
  updateUser,
} from "../controllers/userController";

const router = Router();

/**
 * Get my profile
 */
router.get("/me", verifyFirebaseToken, async (req, res) => {
  const uid = (req as any).user.uid;
  const user = await getUser(uid);
  res.json(user);
});

/**
 * Initialize user profile (called after login)
 */
router.post("/init", verifyFirebaseToken, async (req, res) => {
  const decoded = (req as any).user;

  await createUserIfNotExists({
    uid: decoded.uid,
    email: decoded.email,
    displayName: decoded.name,
    photoURL: decoded.picture,
    friends: [],
    createdAt: Date.now(),
  });

  res.json({ ok: true });
});

/**
 * Update preferences (favorite song, keywords, etc.)
 */
router.patch("/me", verifyFirebaseToken, async (req, res) => {
  const uid = (req as any).user.uid;
  await updateUser(uid, req.body);
  res.json({ ok: true });
});

router.post("/friends/request", verifyFirebaseToken, async (req, res) => {
  const fromUid = (req as any).user.uid;
  const { toUid } = req.body;

  if (!toUid) return res.status(400).json({ error: "toUid required" });

  await db.collection("users").doc(toUid).update({
    friendRequests: admin.firestore.FieldValue.arrayUnion(fromUid),
  });

  res.json({ ok: true });
});

router.post("/friends/accept", verifyFirebaseToken, async (req, res) => {
  const myUid = (req as any).user.uid;
  const { fromUid } = req.body;

  const meRef = db.collection("users").doc(myUid);
  const friendRef = db.collection("users").doc(fromUid);

  await meRef.update({
    friends: admin.firestore.FieldValue.arrayUnion(fromUid),
    friendRequests: admin.firestore.FieldValue.arrayRemove(fromUid),
  });

  await friendRef.update({
    friends: admin.firestore.FieldValue.arrayUnion(myUid),
  });

  res.json({ ok: true });
});

export default router;
