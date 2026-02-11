import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import { generateSKU, ensureUniqueSKU } from "../utils/skuGenerator.js"

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
            variantPrices, // NEW: prices per variant
            bestseller,
            isActive,
            isFeatured
        } = req.body

        // Handle dynamic image uploads with color metadata
        // With upload.any(), req.files is an array of file objects
        const uploadedImages = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                // file.fieldname will be like 'image0', 'image1', etc.
                if (file.fieldname.startsWith('image')) {
                    const imageIndex = file.fieldname.replace('image', '');
                    const colorKey = `imageColor${imageIndex}`;
                    const imageColor = req.body[colorKey] || null;

                    uploadedImages.push({
                        file: file,
                        color: imageColor === "" ? null : imageColor
                    });
                }
            });
        }

        // Upload images to cloudinary with color metadata
        let imagesUrl = await Promise.all(
            uploadedImages.map(async (item, index) => {
                let result = await cloudinary.uploader.upload(item.file.path, { resource_type: 'image' });
                return {
                    url: result.secure_url,
                    order: index + 1,
                    color: item.color
                }
            })
        )

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Parse data
        const sizesArray = JSON.parse(sizes);
        const colorsArray = colors ? JSON.parse(colors) : [];
        const stockData = stockByVariant ? JSON.parse(stockByVariant) : {};
        const priceData = variantPrices ? JSON.parse(variantPrices) : {};

        // Create variants array
        const variants = [];
        let minPrice = Number(price) || Infinity;

        for (const size of sizesArray) {
            for (const color of colorsArray) {
                const variantKey = `${size}-${color}`;
                const variantStock = stockData[variantKey] || 0;
                const variantPrice = priceData[variantKey] || Number(price);

                // Update minPrice for basePrice
                if (variantPrice < minPrice) {
                    minPrice = variantPrice;
                }

                // Generate SKU
                const baseSKU = generateSKU(title, color, size);
                const sku = await ensureUniqueSKU(baseSKU, productModel);

                // Get variant-specific images
                const variantImages = imagesUrl
                    .filter(img => img.color === color || img.color === null)
                    .map(({ url, order }) => ({ url, order }));

                variants.push({
                    sku,
                    size,
                    color,
                    price: variantPrice,
                    stock: variantStock,
                    images: variantImages
                });
            }
        }

        const productData = {
            title,
            name: title, // Backward compatibility
            slug,
            description,
            category,
            basePrice: minPrice !== Infinity ? minPrice : Number(price),
            price: Number(price), // Deprecated but kept for compatibility
            discountPrice: discountPrice ? Number(discountPrice) : null,
            currency: "INR",
            subCategory,
            brand: brand || "",
            bestseller: bestseller === "true" ? true : false,
            isActive: isActive === "false" ? false : true,
            isFeatured: isFeatured === "true" ? true : false,
            sizes: sizesArray,
            colors: colorsArray,
            variants: variants, // NEW: Variants array
            stockByVariant: stockData, // Keep for backward compatibility
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

// function for updating product
const updateProduct = async (req, res) => {
    try {
        const {
            productId,
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

        // Fetch existing product to handle images if not updated
        const existingProduct = await productModel.findById(productId);
        if (!existingProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        // Handle image updates (only if new images are uploaded)
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        let imagesUrl = existingProduct.images;

        if (image1 || image2 || image3 || image4) {
            const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

            // If new images provided, upload them
            // Note: Currently replacing all images if any new one is uploaded for simplicity
            // A granular update would require more complex logic
            if (images.length > 0) {
                imagesUrl = await Promise.all(
                    images.map(async (item, index) => {
                        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return {
                            url: result.secure_url,
                            order: index + 1
                        }
                    })
                )
            }
        }

        const updateData = {
            title,
            name: title,
            description,
            category,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            subCategory,
            brand: brand || "",
            bestseller: bestseller === "true",
            isActive: isActive === "true", // Note: Ensure frontend sends "true"/"false" similarly to add
            isFeatured: isFeatured === "true",
            sizes: JSON.parse(sizes),
            colors: colors ? JSON.parse(colors) : [],
            stockByVariant: stockByVariant ? JSON.parse(stockByVariant) : {},
            images: imagesUrl,
            updatedAt: Date.now()
        }

        await productModel.findByIdAndUpdate(productId, updateData);

        res.json({ success: true, message: "Product Updated" })

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

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }