import User from "./../models/userModel.js";
import jwt from "jsonwebtoken";

export const protectRoute = async(req, res, next) => {

   try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return res.status(401).json("Not authorized, no token provided");
    }

   const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

   if (!decoded) { 
    return res.status(401).json("Not authorized, invalid token");}


   const user = await User.findById(decoded.userId);

   if (!user) {
    return res.status(401).json("Not authorized, user not found");}



   req.user = user;

   next();
   } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json("Not authorized, token expired");
    }
    console.log("error protect route middleware", error.message);
    res.status(500).json({ message: "Internal server error" });
   }
}


export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
     return next();  }

     else {
        return res.status(403).json("Not authorized as admin");
     }
    };


    


