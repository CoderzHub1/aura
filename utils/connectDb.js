import mongoose from "mongoose";

const connectDb = (handler) => async (req, res) => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log("Already connected to the database.");
            return handler(req, res);
        } else {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to the database successfully.");
            return handler(req, res);
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        return res.status(500).json({ message: "Database connection error", error: error.message });
    }
};

export default connectDb;