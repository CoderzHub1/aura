import mongoose from 'mongoose';

const connectDb = (handler) => async (req, res) => {
    if (mongoose.connections[0].readyState) {
        console.log('Already connected to the database.');
        return handler(req,res);
    }
    else {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to the database: ${process.env.MONGO_URI}`);
        return handler(req,res);
    }
};

export default connectDb;