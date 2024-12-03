import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { create } from "zustand";


export const useProductStore = create((set, get) => ({
   

     products: [],
     loading: false,

     setProducts: (products) => set({ products }),

     createProduct: async (productData) => {
        set({loading: true});

        try {
            const res = await axios.post("/products", productData);  
            set((prevState) => ({
				products: [...prevState, res.data],
				loading: false,
			}));
            toast.success("Product created successfully");
        } catch (error) {
            
            toast.error(error.message );
            set({loading: false});
        }
     },

     deleteProduct: async (id) => {
        set({loading: true});

        try {
            await axios.delete(`/products/${id}`);
       // just filter out the deleted product from the state
            set((prevState) => ({
              products: prevState.products.filter((product) => product._id !== id),
              loading: false  
            }))
        } catch (error) {
            set({loading: false});
            toast.error(error.message || "failed to delete product");
        }
     },

    addProductToFeature: async (id) => {  
        set({loading: true});
          try {
            const response = await axios.patch(`/products/${id}`);

            set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === id ? { ...product, isFeatured: response.data } : product
				),
                 loading: false
            }))
          } catch (error) {
            set({loading: false});
            toast.error(error.message || "failed to update product");
          }
    },

     
       

     fetchProducts: async () => {
        set({loading: true});

        try {
            const res = await axios.get("/products");

            set({products: res.data, loading: false});
        } catch (error) {
            set({error: "failed to fetch products", loading: false});
            toast.error(error.message);
        }
    },

    fetchProductsbyCategory: async (category) => {
        set({loading: true});

        try {
            const res = await axios.get(`/products/category/${category}`);
            set({products: res.data, loading: false});
        } catch (error) {
           toast.error(error.message);
           set({loading: false}); 
        }
    }
     
}));

