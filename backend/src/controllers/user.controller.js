import User from "../model/user.model.js";

export const postUser = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email    });

    if (existingUser) {
        
        return res.status(400).json({ message: "Email already exists" });
    }
    
    const user = new User({email});
    await user.save();
    
    return res.status(201).json({ message: "User created successfully" });
};

export const getAllUser = async (req, res) => {
    const users = await User.find();
    res.status(200).json({ users });
};
