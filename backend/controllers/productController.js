import { redis } from "../lib/redis.js";
import Product from "../models/productModel.js";
import {v2 as cloudinary} from "cloudinary";

export const getAllProducts = async(req, res) => {
       try {
        const products = await Product.find();

        res.status(200).json(products);
       } catch (error) {
        console.log("error getting all products", error.message);
        res.status(500).json({message: "Internal server error"});
       }
};


export const getFeaturedProducts = async(req, res) => {
    try {
       let featuredProducts = await redis.get("featuredProducts");
        
       if (featuredProducts) {

        return res.status(200).json(JSON.parse(featuredProducts));
       }


       const featuredproducts = await Product.find({isFeatured: true}).lean(); // lean returns plain javascript object

       if (!featuredproducts) {
        return res.status(404).json({message: "No featured products found"});
       }

       await redis.set("featuredProducts", JSON.stringify(featuredproducts));


       return res.status(200).json(featuredproducts);

    } catch (error) {
        console.log("error getting featured products", error.message);
        res.status(500).json({message: "Internal server error"});
    }

}


export const createProduct = async(req, res) => {
    try {
     
        const { name, description, price, image, category } = req.body;

        let cloudinaryRes = null;
        if(image) {
         cloudinaryRes = await cloudinary.uploader.upload(image);
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryRes?.secure_url ? cloudinaryRes.secure_url : "",
            category,
        });


        return res.status(201).json(product);
        

    } catch (error) {
        console.log("error creating product", error.message);
        res.status(500).json({message: "Internal server error"});
    }

};



export const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params;
        

        const product = await Product.findById(id);


        if (!product) {
            return res.status(404).json({message: "Product not found"});
        };


        if (product.image) {
            const imageId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(imageId);
                console.log("image deleted");
            } catch (error) {
                console.log("error deleting image from cloudinary", error.message);
            }

        }


        await Product.findByIdAndDelete(id);

        res.status(200).json({message: "Product deleted successfully"});

    } catch (error) {
        console.log("error deleting product", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};


export const getRecommendedProducts = async(req, res) => {

    try {
        
      const products = await Product.aggregate([
        {
            $sample: {size: 3},

        },

        {
            $project: {
                name: 1,
                description: 1,
                price: 1,
                image: 1,
                category: 1,
            }
        }
      ]);
         
      res.json(products);
    } catch (error) {
      console.log("error getting recommended products", error.message);
      res.status(500).json({message: "Internal server error"});  
    }
};



export const getProductsByCategory = async(req, res) => {

   const { category } = req.params;
    try {
       const products = await Product.find({category});

       res.status(200).json(products);
} catch (error) {
    console.log("error getting products by category", error.message);
    res.status(500).json({message: "Internal server error"});
}

}



export const toggleFeaturedProduct = async(req, res) => {

    try {
        const product = await Product.findById(req.params.id);

        if(product) {
            product.isFeatured = !product.isFeatured;// we negate if false it becomes true and vice versa

            const updatedProduct = await product.save();

            // need to update cache as well
            await updateFeaturedProductsCache();

            return res.status(200).json(updatedProduct);
        }

    } catch (error) {
        console.log("error toggling featured product", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};



async function updateFeaturedProductsCache() {
try {
    
    const featuredProducts = await Product.find({isFeatured: true}).lean(); 

    await redis.set("featuredProducts", JSON.stringify(featuredProducts)); 
} catch (error) {
    console.log("error updating featured products cache", error.message);
  
}

}