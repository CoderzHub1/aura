import Users from "../models/Users";
import connectDb from "../utils/connectDb";

const handler = async (req, res) => {
    const users = await Users.find();
    res.status(200).json(users);
};

export default connectDb(handler);