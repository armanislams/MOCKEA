import User from "../model/user.js";

// Helper function to check if requesting user is the owner or an admin
const isOwnerOrAdmin = async (decodedEmail, targetEmail) => {
    if (!decodedEmail || !targetEmail) return false;
    if (decodedEmail.toLowerCase().trim() === targetEmail.toLowerCase().trim()) {
        return true;
    }
    const requestor = await User.findOne({ email: decodedEmail.toLowerCase().trim() });
    return !!(requestor && requestor.role === 'admin');
};

export const postUser = async (req, res) => {
    const { email, name, targetExam, gender } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Please provide email and name" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = new User({
        name,
        email: cleanEmail,
        targetExam: targetExam || "IELTS",
        gender: gender || null
    });
    await user.save();

    return res.status(201).json({ success: true, message: "User created successfully" });
};

export const getAllUser = async (req, res) => {
    const { search, role, plan, status, page, limit } = req.query;

    const filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    if (role && role !== "all") filter.role = role;
    if (plan && plan !== "all") filter.plan = plan;
    if (status === "banned") filter.isBanned = true;
    if (status === "active") filter.isBanned = { $ne: true };

    const total = await User.countDocuments(filter);
    res.set("X-Total-Count", total.toString());
    res.set("Access-Control-Expose-Headers", "X-Total-Count");

    let query = User.find(filter).sort({ createdAt: -1 });

    if (page || limit) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);

        const users = await query;
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        });
    }

    const users = await query;
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users,
        total
    });
};

export const getUserRole = async (req, res) => {
    const { email } = req.params;
    const cleanEmail = email.toLowerCase().trim();

    const authorized = await isOwnerOrAdmin(req.decoded_email, cleanEmail);
    if (!authorized) {
        return res.status(403).json({ success: false, message: "Access denied: cannot fetch role of another user" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User role fetched successfully", role: user.role });
};

export const getUserProfile = async (req, res) => {
    const { email } = req.params;
    const cleanEmail = email.toLowerCase().trim();

    const authorized = await isOwnerOrAdmin(req.decoded_email, cleanEmail);
    if (!authorized) {
        return res.status(403).json({ success: false, message: "Access denied: cannot access another user's profile" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User profile fetched successfully", user });
};

export const verifyEmail = async (req, res) => {
    const { email } = req.params;
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Email verified successfully" });
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["student", "admin", "instructor"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { returnDocument: 'after' }
    );

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
};

export const updateUserPlan = async (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;

    const allowedPlans = ["free", "standard", "premium"];
    if (!allowedPlans.includes(plan)) {
        return res.status(400).json({ success: false, message: "Invalid plan specified" });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { plan },
        { returnDocument: 'after' }
    );

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: `User plan updated to ${plan}`, user });
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
};

export const toggleBanUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
        success: true,
        message: user.isBanned ? "User has been banned" : "User has been unbanned",
        user,
    });
};

export const updateUserExamPreference = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetExam } = req.body;

        const allowedExams = ["IELTS", "PTE", "BOTH"];
        if (!allowedExams.includes(targetExam)) {
            return res.status(400).json({ success: false, message: "Invalid exam preference specified" });
        }

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify ownership/admin permissions
        const authorized = await isOwnerOrAdmin(req.decoded_email, userToUpdate.email);
        if (!authorized) {
            return res.status(403).json({ success: false, message: "Access denied: cannot update another user's preferences" });
        }

        userToUpdate.targetExam = targetExam;
        await userToUpdate.save();

        res.status(200).json({ success: true, message: `Exam preference updated to ${targetExam}`, user: userToUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
