import express from "express";

import { addToCart, removeAllFromCart, getCartItems, updateCartItemQuantity } from "../controllers/cartController.js";
import { protectRoute } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/",protectRoute, addToCart);

router.delete("/",protectRoute, removeAllFromCart);

router.get("/",protectRoute, getCartItems);

router.put("/:id",protectRoute, updateCartItemQuantity); 


export default router;