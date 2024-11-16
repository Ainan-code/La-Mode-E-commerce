import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import productsRoutes from "./routes/productRoutes.js";


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);




app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
});