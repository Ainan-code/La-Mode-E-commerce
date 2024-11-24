  

  import {create} from "zustand";
  import axios from "../lib/axios";
  import {toast} from "react-hot-toast";


 export  const useUserStore = create((set, get) => ({ 
      
      user: null,
      loading: false,
      checkingAuth: true,


      signup: async ({name, email, password, confirmPassword}) => {
        set({loading: true});
        if (password !== confirmPassword) {
            set({loading: false});
            return toast.error("Passwords do not match");
        }

        if (!name || !email || !password) {
            set({loading: false});
            return toast.error("Please fill in all fields");
        }

        if (password.length < 6) {
            set({loading: false});
            return toast.error("Password must be at least 6 characters");
        }




         try {
            const res = await axios.post("/auth/signup", {name, email, password});
            set({user: res.data, loading: false});
            return toast.success("Registration successful");

         } catch (error) {
           set({loading: false});
           return toast.error(error.response.data.message) || "An error occured"; 
         }
          

      },

      login: async ({email, password}) => {
        set({loading: true});
         if (!email || !password) {
            set({loading: false});
            return toast.error("Please fill in all fields");
      }

      try {
        const res = await axios.post("/auth/login", {email, password});
        set({user: res.data, loading: false});
        return toast.success("Login successful");
      } catch (error) {
        set({loading: false});
        return toast.error(error.response.data.message) || "An error occured";
      }

    },

    checkAuth: async () => {
        set({checkingAuth: true});

        try {
            const res = await axios.get("/auth/profile");
            set({user: res.data, checkingAuth: false});
        } catch (error) {
           set({checkingAuth: false, user: null}); 
        }
    },


    logOut: async () => {

        set({loading: true});

        try {
           const res = await axios.post("/auth/logout");
           set({user: null, loading: false}); 
        } catch (error) {
            set({loading: false});
            return toast.error(error.res.data.message) || "An error occured";
        }
    }
      
   }));



