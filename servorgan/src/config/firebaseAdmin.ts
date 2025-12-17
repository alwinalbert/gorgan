import admin from "firebase-admin";
import path from "path";

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(
    __dirname,
    "../../keys/upisde-down-survival-firebase-adminsdk-fbsvc-bb1ac83d14.json"
  );

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export { admin }; // 👈 ADD THIS