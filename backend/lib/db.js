import mongoose from "mongoose";


export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to Mongodb")
    } catch (error) {
        console.log("error connecting to mongodb", error.message)
        process.exit(1);
    }
} 