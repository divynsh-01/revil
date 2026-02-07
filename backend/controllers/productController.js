import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const {
            title,
            description,
            price,
            discountPrice,
            category,
            subCategory,
            brand,
            sizes,
            colors,
            stockByVariant,
            bestseller,
            isActive,
            isFeatured
        } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item, index) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return {
                    url: result.secure_url,
                    order: index + 1
                }
            })
        )

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const productData = {
            title,
            name: title, // Backward compatibility
            slug,
            description,
            category,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            currency: "INR",
            subCategory,
            brand: brand || "",
            bestseller: bestseller === "true" ? true : false,
            isActive: isActive === "false" ? false : true,
            isFeatured: isFeatured === "true" ? true : false,
            sizes: JSON.parse(sizes),
            colors: colors ? JSON.parse(colors) : [],
            stockByVariant: stockByVariant ? JSON.parse(stockByVariant) : {},
            images: imagesUrl,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {

        const products = await productModel.find({});
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }