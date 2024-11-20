import Product from "../models/productModel.js";


export const addToCart = async(req, res) => {


try {
    const{ productId } = req.body;
    const {user} = req.user;
    
    const existingItem = user.cartItems.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        user.cartItems.push(productId);
    }

    await user.save();

    res.json(user.cartItems);

} catch (error) {
    console.log("error adding to cart", error.message);
    res.status(500).json({message: "Internal server error"});
}


}


export const removeAllFromCart = async(req, res) => {

    const {productId} = req.body;
    const {user} = req.user;

    try {
        if(!productId) {
           user.cartItems = [];
        }

        else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }

        await user.save();

        res.json(user.cartItems);
    } catch (error) {
        console.log("error removing from cart", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}


export const updateCartItemQuantity = async(req, res) => {

   
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body;

        const user = req.user

        const existingItem = user.cartItems.find(item => item.id === productId);

        if (existingItem) {
           if (quantity === 0) {
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
            await user.save();
            res.json(user.cartItems); }

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
           
      res.status(404).json({message: "Product not found in the cart"});

        }

        
    } catch (error) {
      console.log("error updating cart item quantity", error.message);
      res.status(500).json({message: "Internal server error"});  
    }
}

export const getCartItems = async(req, res) => {
    try {
       const products = await Product.find({_id: {$in: req.user.cartItems}});


       // add the quantity property to each product;

   const cartItems =  products.map(product => {
           const item = req.user.cartItems.find(item => item.id === product._id);
           return {...product.toJSON(), quantity:item.quantity}
       })


       res.json(cartItems);

        
    } catch (error) {
       console.log("error getting cart items", error.message);
       res.status(500).json({message: "Internal server error"}); 
    }


}
