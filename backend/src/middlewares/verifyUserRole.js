import User from "../model/user.js";

// Middleware to fetch user data from DB and verify role
const verifyUserRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const userEmail = req.decoded_email;

      // Fetch user from database
      const user = await User.findOne({ email: userEmail });

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found in database"
        });
      }

      // Attach user object to request
      req.user = user;

      // If specific roles are required, check if user has one of them
      if (requiredRoles.length > 0) {
        if (!requiredRoles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Required role(s): ${requiredRoles.join(", ")}`
          });
        }
      }

      next();
    } catch (err) {
      console.log("Role verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Error verifying user role"
      });
    }
  };
};

export default verifyUserRole;
