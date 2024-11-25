import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { create } from "zustand";


export const useProductStore = create((set, get) => ({
   

     products: [],
     loading: false,

     setProducts: (products) => set({products}),

     createProduct: async (productData) => {
        set({loading: true});

        try {
            const res = await axios.post("/products", productData);  
            set((prevState) => ({
               products : [...prevState.products, res.data],
               loading: false 
            }))
            toast.success("Product created successfully");
        } catch (error) {
            set({loading: false});
            return toast.error(error.response.data.message) || "An error occured";
        }
     }
     
}));