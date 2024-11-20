import stripe from "../lib/stripe.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";



export const createCheckoutSession = async(req, res) => {
    try {
        const {products, couponCode} = req.body;

        // check if products are in array
        if(!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({message: "products are empty"});
        }
          let totalAmount = 0
        const lineItems = products.map((product) => {

            const amount = Math.round(product.price * 100); // stripe wants the amount in cents;
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount
                },
            }


        });

        let coupon = null;

        if(couponCode) {
            const coupon = await Coupon.findOne({code: couponCode, isActive: true, userId: req.user._id});

            if(coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${process.env.Client_URl}/purchase-success/success_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.Client_URl}/purchase-failure `,

            discounts:
            coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage)
                }
            ]: [],

            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))),

            }
        });

        // create a new coupon for the user if their total purchase is more than 200$ i cents 

        if(totalAmount >= 20000) {
          await  createNewCoupon(req.user._id);
        }


        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100});
          

             
      

    } catch (error) {
        console.log("error creating checkout session", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};



export const checkoutSuccess = async(req, res) => {

    try {
        const {sessionId} = req.body;

        const session = await stripe.checkout.sessions.retrieve(sessionId);
          // check if the payment was successful
        if(session.payment_status === "paid") {
         // deactivate if a coupon was used
            if(session.metadata.couponCode) {
                 await Coupon.findOneAndUpdate({code: session.metadata.couponCode, userId: session.metadata.userId}, {
                    isActive: false });
                
            };


            const products = JSON.parse(session.metadata.products);

            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((p) => ({
                    id: p._id,
                    quantity: p.quantity,
                    price: p.price,
                })),

                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId,
            });


            await newOrder.save();


            res.status(200).json({message: "Payment successful and order created",
                success:true,
                orderId: newOrder._id
            });



        }
    } catch (error) {
        console.log("error in checkout success controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}


async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",

    });

    return coupon.id;
}

async function createNewCoupon(userId ) {
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
}