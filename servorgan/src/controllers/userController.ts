import { db } from "../config/firebaseAdmin";
import type { UserProfile } from "../types/user";

const usersCol = db.collection("users");

/**
 * Create user profile on first login
 */
export async function createUserIfNotExists(profile: UserProfile) {
  const ref = usersCol.doc(profile.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      ...profile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

/**
 * Get user profile
 */
export async function getUser(uid: string) {
  const snap = await usersCol.doc(uid).get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * Update partial user fields
 */
export async function updateUser(
  uid: string,
  updates: Partial<UserProfile>
) {
  await usersCol.doc(uid).update({
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Update threat status (used by sensor logic)
 */
export async function updateThreatStatus(
  uid: string,
  currentThreat: UserProfile["currentThreat"]
) {
  await usersCol.doc(uid).update({
    currentThreat,
    updatedAt: Date.now(),
  });
}
