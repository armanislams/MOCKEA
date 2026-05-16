import User from "../model/user.js";

export const postUser = async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Please provide email and name" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = new User({ name, email });
    await user.save();

    return res.status(201).json({ success: true, message: "User created successfully" });
};

export const getAllUser = async (req, res) => {
    const { search, role, plan, status } = req.query;

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

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: "Users fetched successfully", users });
};

export const getUserRole = async (req, res) => {
    const { email } = req.params;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User role fetched successfully", role: user.role });
};

export const getUserProfile = async (req, res) => {
    const { email } = req.params;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User profile fetched successfully", user });
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
        { new: true }
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
        { new: true }
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
