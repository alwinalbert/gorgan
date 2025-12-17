import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(
    __dirname,
    "../../keys/upisde-down-survival-firebase-adminsdk-fbsvc-bb1ac83d14.json"
  );

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };