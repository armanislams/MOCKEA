import "dotenv/config";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";

const decoded = Buffer.from(process.env.FIREBASE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const authInstance = getAuth(app);
const messagingInstance = getMessaging(app);

const admin = {
  auth: () => authInstance,
  messaging: () => messagingInstance
};

export default admin;
