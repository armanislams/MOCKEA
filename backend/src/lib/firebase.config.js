import "dotenv/config";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const decoded = Buffer.from(process.env.FIREBASE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const authInstance = getAuth(app);

const admin = {
  auth: () => authInstance
};

export default admin;
