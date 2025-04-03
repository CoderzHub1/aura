import User from "../models/Users";
import connectDb from "../utils/connectDb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const handler = async (req, res) => {
    await connectDb();
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Email is not valid" });
    }

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        return res.status(200).json({ token });
    }

    catch{
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default connectDb(handler);