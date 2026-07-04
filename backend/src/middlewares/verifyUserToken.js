import admin from "../lib/firebase.config.js";
import User from "../model/user.js";

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
    
    // Update lastActive timestamp in background asynchronously
    if (decoded.email) {
      User.updateOne(
        { email: decoded.email.toLowerCase().trim() },
        { $set: { lastActive: new Date() } }
      ).catch((err) => console.error("Error updating user activity:", err));
    }
    
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "unauthorized access" });
  }
};

export default verifyUserToken;