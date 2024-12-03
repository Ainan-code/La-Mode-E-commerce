     import {create} from "zustand";
     import axios from "../lib/axios";
     import {toast} from "react-hot-toast";



    export const useCartStore = create((set, get) => ({

        cart: [],
        loading: false,
        coupon: null,
        total: 0,
        subtotal:0,  // for discount purposes


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