 import { redis } from "../lib/redis.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

 const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });


    return {accessToken, refreshToken};
    
 } ;


 const storeUserRefreshToken = async(userId, refreshToken) => {
   await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); };


 const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "strict", 
       maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "strict",
       maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    }

 export const signup = async(req, res) => {
     try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
       return  res.status(400).json("Please fill all the fields");
      }

      if (password.length < 6) {
          return  res.status(400).json("Password must be at least 6 characters");}


      const userExist = await User.findOne({ email });
   
      if (userExist) {
       return  res.status(400).json("User already exist");
      }
      const user = await User.create({
         name,
         email,
         password,
      });

      const {accessToken, refreshToken} = generateTokens(user._id);

      await storeUserRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);
   
      if (user) {
        return res.status(201).json({
            user: {
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email
            },message: "User created successfully"}); 
      }
     } catch (error) {
      console.log("error signup user", error.message);
      res.status(500).json({message: "Internal server error"});
     }

   };


 export const login = async(req, res) => {
   try {
       const { email, password } = req.body;
   
       if (!email || !password) {
         res.status(400).json("Please fill all the fields"); }

         const user = await User.findOne({ email });

         if(user && (await user.comparePassword(password))) {
         const {accessToken, refreshToken} =   generateTokens(user._id);
            
            await storeUserRefreshToken(user._id, refreshToken);

            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
               id: user._id,
               name: user.name,
               email: user.email,
               role: user.role,
               message: "Login successful",
         });
         } else {
            res.status(401).json("Invalid email or password");
         }
   } catch (error) {
      console.log("error login user", error.message);
      res.status(500).json({message: "Internal server error"});
   }

 };


 export const logout = async(req, res) => {
    try {
     const refreshToken = req.cookies?.refreshToken;

     if (refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refreshToken:${decoded.userId}`);
     }

     res.clearCookie("accessToken");
     res.clearCookie("refreshToken");

     res.status(200).json({message: "Logout successful"});
    } catch (error) {
      console.log("error logout user", error.message);
      res.status(500).json({message: "Internal server error"});
    }
 };


 export const refreshToken = async(req, res) => {
   try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
         return res.status(401).json("No token provided");}

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

      if (storedToken !== refreshToken) {
            return res.status(401).json("Invalid refresh token");
      }

      const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

      res.cookie("accessToken", accessToken,);

      res.status(200).json({message: "Refresh token successful"});
     

   } catch (error) {
      console.log("error refresh token contoller", error.message);
      res.status(500).json({message: "Internal server error"});
   }

}