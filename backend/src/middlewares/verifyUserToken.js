import admin from "../lib/firebase.config.js";
import User from "../model/user.js";

// In-memory cache to throttle lastActive database writes (limit to once every 5 minutes per user)
const activeUpdateCache = new Map();
const UPDATE_INTERVAL_MS = 5 * 60 * 1000;

//verify user
const verifyUserToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  try {
    const idToken = token.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    // ('decoded token', decoded);
    req.decoded_email = decoded.email;
    
    // Update lastActive timestamp in background asynchronously with throttling
    if (decoded.email) {
      const userEmailKey = decoded.email.toLowerCase().trim();
      const now = Date.now();
      const lastUpdate = activeUpdateCache.get(userEmailKey);
      
      if (!lastUpdate || now - lastUpdate > UPDATE_INTERVAL_MS) {
        activeUpdateCache.set(userEmailKey, now);
        User.updateOne(
          { email: userEmailKey },
          { $set: { lastActive: new Date() } }
        ).catch((err) => console.error("Error updating user activity:", err));
      }
    }
    
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "unauthorized access" });
  }
};

export default verifyUserToken;