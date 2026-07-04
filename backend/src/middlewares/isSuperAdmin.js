import User from "../model/user.js";

const isSuperAdmin = async (req, res, next) => {
  try {
    const userEmail = req.decoded_email;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized access: no token found" });
    }

    const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin privileges required."
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Super Admin verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Error verifying Super Admin role"
    });
  }
};

export default isSuperAdmin;
