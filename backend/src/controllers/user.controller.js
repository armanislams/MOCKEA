import User from "../model/user.js";

export const postUser = async (req, res) => {
    const { email,name } = req.body;
    
    if (!email || !name) {
        return res.status(400).json({success:false, message: "Please provide email and name" });
    }
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email    });

    if (existingUser) {
        
        return res.status(400).json({success:false, message: "Email already exists" });
    }
    
    const user = new User({name,email});
    await user.save();
    
    return res.status(201).json({success:true, message: "User created successfully" });
};

export const getAllUser = async (req, res) => {
    const users = await User.find();
    res.status(200).json( {success:true,message:"Users fetched successfully",users:users});
};

export const getUserRole = async (req, res) => {
    const {email} = req.params;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User role fetched successfully", role: user.role });
};
