import Coupon from "../models/couponModel.js";

  


  export  const getCoupon = async(req, res) => {


    try {
        const coupon = await Coupon.find({userId: req.user._id, isActive: true});

        res.json(coupon || null);
    } catch (error) {
        console.log("error getting coupon", error.message);
        res.status(500).json({message: "Internal server error"});
    }
  };



  export const validateCoupon = async(req, res) => {

    const {code} = req.body;

    try {
        const coupon = await Coupon.findOne({code: code, isActive: true});

        if(!coupon) {
            return res.status(404).json({message: "Coupon not found"});
        }

        if(coupon.expirationDate < Date.now()) {
            coupon.isActive = false;
            await coupon.save();

            res.json({message: "Coupon expired"});
        };


        res.status(200).json({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            message: "Coupon is valid"

        })
    } catch (error) {
        console.log("error validating coupon", error.message);
        res.status(500).json({message: "Internal server error"});
    }
  };