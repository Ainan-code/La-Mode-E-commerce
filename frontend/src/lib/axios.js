 import axios from "axios";


 const axiosIstance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : " /api",
    withCredentials: true, // take cares of sending cookies with the request
    });
  
    export default axiosIstance;