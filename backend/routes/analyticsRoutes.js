 import express from "express";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { getAnalyticsData, getDailyDataSales } from "../controllers/analyticsController.js";


 const router = express.Router();
 
  router.get("/",protectRoute, isAdmin, async(req, res) => {

    try {
        const analyticsData = await getAnalyticsData();
        // for the analytics chart
     const   endDate = new Date();
      const   startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      

      const dailyDataSales = await getDailyDataSales(startDate, endDate);

      res.json({
        analyticsData,
        dailyDataSales
      })

    } catch (error) {
       console.log("error getting analytics data", error.message);
       res.status(500).json({message: "Internal server error"}); 
    }
      
  })



 export default router;