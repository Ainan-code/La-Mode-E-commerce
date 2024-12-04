     import {create} from "zustand";
     import axios from "../lib/axios";
     import {toast} from "react-hot-toast";



    export const useCartStore = create((set, get) => ({

        cart: [],
        loading: false,
        coupon: null,
        total: 0,
        subtotal:0,  // for discount purposes
        isCouponApplied: false,


        getCartProducts: async() => {


            try {
               const res = await axios.get("/carts");
               set({cart: res.data});
              get().calculateTotals();
            } catch (error) {
              set({cart: []});  
              toast.error(error.message || "An error occured");
            }
        },

        getMyCoupon: async() => {
               
        },

        addToCart: async(product) => {
          
            try {
                await axios.post("/carts", { productId: product._id });
                toast.success("Product added to cart");
    
                set((prevState) => {
                    const existingItem = prevState.cart.find((item) => item._id === product._id);
                    const newCart = existingItem
                        ? prevState.cart.map((item) =>
                                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                          )
                        : [...prevState.cart, { ...product, quantity: 1 }];
                    return { cart: newCart };
                });
                get().calculateTotals();
            } catch (error) {
                toast.error(error.response.data.message || "An error occurred");
            }

        },

        removeFromCart: async(productId) => {

           try {
            await axios.delete("/carts", {data: {productId}});
            set((prevState) => ({
             cart: prevState.cart.filter((item) => item._id!== productId) // update the UI state with the new cart.
            }));
            get().calculateTotals();
           } catch (error) {
            toast.error(error.message)
           }
        },

        updateQuantity: async (productId, quantity) => {
            if (quantity === 0) {
                get().removeFromCart(productId);
                return;
            }
    
            await axios.put(`/carts/${productId}`, { quantity });
            set((prevState) => ({
                cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
            }));
            get().calculateTotals();
        },
        calculateTotals: () => {
            const {cart, coupon} = get();
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            let total = subtotal;

            if (coupon) {
                const discount = (coupon.discountPercentage / 100) * subtotal;

                total = subtotal - discount;
            }
            set({subtotal, total});
        }
    }));