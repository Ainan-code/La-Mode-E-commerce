import express from "express";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/productController.js";


const router = express.Router();




router.get("/",protectRoute, isAdmin, getAllProducts);

router.get("/featured", getFeaturedProducts);

router.get("/recommendations", getRecommendedProducts);

router.get("/category/:category", getProductsByCategory);


router.patch("/:id", protectRoute, isAdmin, toggleFeaturedProduct);


router.post("/",protectRoute, isAdmin, createProduct);




router.delete("/:id", protectRoute, isAdmin, deleteProduct)










export default router;