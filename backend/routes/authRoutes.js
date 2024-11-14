import express from "express";
import { getLogin, getSignup, getLogout } from "../controllers/authController.js";


const router = express.Router();




router.get("/signup", getSignup);


router.get("/login", getLogin);

router.get("/logout", getLogout);











export default router;