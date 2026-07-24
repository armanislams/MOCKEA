import User from "../model/user.js";
import AuditLog from "../model/auditLog.js";

/**
 * Calculates plan expiration date based on duration parameters.
 * - 'infinite' or free plan => null
 * - 'months' => Current date + monthsCount (calendar-aware clamping & end of day)
 * - 'custom' => Parse customEndDate and set to 23:59:59.999 (End of Day)
 */
export const calculateExpirationDate = (timeframeType, monthsCount = 1, customEndDate = null) => {
  if (!timeframeType || timeframeType === "infinite") {
    return null;
  }

  if (timeframeType === "months") {
    const numMonths = parseInt(monthsCount, 10);
    if (isNaN(numMonths) || numMonths <= 0) {
      throw new Error("Invalid months count specified");
    }

    const now = new Date();
    const targetDate = new Date(now);

    // Calendar month addition with clamping (e.g. Jan 31 + 1 month -> Feb 28/29)
    const currentDay = targetDate.getDate();
    targetDate.setMonth(targetDate.getMonth() + numMonths);

    // If month overflowed (e.g., Feb 31 became March 3), clamp back to last day of previous month
    if (targetDate.getDate() < currentDay) {
      targetDate.setDate(0);
    }

    // Set to end of day for the calculated target date
    targetDate.setHours(23, 59, 59, 999);
    return targetDate;
  }

  if (timeframeType === "custom") {
    if (!customEndDate) {
      throw new Error("Custom end date is required when custom timeframe is selected");
    }

    const targetDate = new Date(customEndDate);
    if (isNaN(targetDate.getTime())) {
      throw new Error("Invalid custom end date format");
    }

    // Set to 23:59:59.999 end of day local time
    targetDate.setHours(23, 59, 59, 999);

    if (targetDate.getTime() <= Date.now()) {
      throw new Error("Custom expiration date must be in the future");
    }

    return targetDate;
  }

  return null;
};

/**
 * Reusable core helper for activating or updating a user's subscription plan.
 * Can be invoked by Admin manual updates or future Payment Gateway confirmation handlers.
 */
export const activateUserPlan = async ({
  userId,
  plan,
  timeframeType = "infinite",
  monthsCount = 1,
  customEndDate = null,
  source = "admin_manual",
  transactionId = null,
  actorEmail = "SYSTEM",
  ipAddress = "127.0.0.1",
  userAgent = "Internal",
}) => {
  const allowedPlans = ["free", "standard", "premium"];
  if (!allowedPlans.includes(plan)) {
    throw new Error("Invalid plan specified");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const previousPlan = user.plan;
  const previousExpiry = user.planExpiresAt;

  let planExpiresAt = null;
  let durationType = null;

  if (plan !== "free") {
    durationType = timeframeType || "infinite";
    planExpiresAt = calculateExpirationDate(durationType, monthsCount, customEndDate);
  } else {
    // Setting to 'free' resets expiration
    durationType = null;
    planExpiresAt = null;
  }

  user.plan = plan;
  user.planExpiresAt = planExpiresAt;
  user.planDurationType = durationType;
  user.planAssignedAt = new Date();
  user.planSource = source;
  if (transactionId) {
    user.lastTransactionId = transactionId;
  }

  await user.save();

  // Log Audit Event
  try {
    const audit = new AuditLog({
      actorEmail,
      actorRole: source === "admin_manual" ? "admin" : "system",
      action: "UPDATE_USER_PLAN",
      targetType: "User",
      targetId: user._id.toString(),
      ipAddress,
      userAgent,
      details: {
        previousPlan,
        newPlan: plan,
        previousExpiry,
        newExpiry: planExpiresAt,
        timeframeType: durationType,
        monthsCount: durationType === "months" ? monthsCount : null,
        source,
        transactionId,
      },
    });
    await audit.save();
  } catch (auditErr) {
    console.error("Failed to save audit log for plan activation:", auditErr);
  }

  return user;
};

/**
 * Checks if a user's subscription has expired and automatically downgrades them to 'free'.
 */
export const checkAndAutoExpirePlan = async (user) => {
  if (!user || user.plan === "free" || !user.planExpiresAt) {
    return user;
  }

  const now = new Date();
  if (new Date(user.planExpiresAt) < now) {
    console.log(`[Subscription Engine] Plan for user ${user.email} expired on ${user.planExpiresAt}. Downgrading to free.`);
    
    user.plan = "free";
    user.planExpiresAt = null;
    user.planDurationType = null;
    await user.save();
  }

  return user;
};
