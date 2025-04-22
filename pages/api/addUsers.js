import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Users from "../../models/Users";
import connectDb from "../utils/connectDb";

const handler = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Email is not valid" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({ name, email, password: hashedPassword });
    await user.save();
    
    return res.status(201).json({ message: "User created successfully" });
}

export default connectDb(handler)