import Users from "../models/Users";
import connectDb from "../utils/connectDb";

const handler = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const { email } = req.query;
            const user = await Users.findOne({ email }).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching user data' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { email, updates } = req.body;
            const user = await Users.findOneAndUpdate(
                { email },
                { $set: updates },
                { new: true }
            ).select('-password');
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error updating user data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

export default connectDb(handler); 