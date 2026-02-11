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
        const titleData = req.body.colorTitles ? JSON.parse(req.body.colorTitles) : {};
        const defaultColor = req.body.defaultListingColor || null; // NEW: Color to be used for main listing

        // Create variants array
        const variants = [];
        let minPrice = Number(price) || Infinity;

        for (const size of sizesArray) {
            for (const color of colorsArray) {
                const variantKey = `${size}-${color}`;
                const variantStock = stockData[variantKey] || 0;
                const variantPrice = priceData[variantKey] || Number(price);
                const variantTitle = titleData[color] || title; // Use specific title or default to main title

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
                    variantTitle,
                    isListingVariant: color === defaultColor, // NEW: Set flag if matches default color
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

        let imagesUrl = existingProduct.images || [];

        // Upload new images and append to existing
        if (uploadedImages.length > 0) {
            const newImages = await Promise.all(
                uploadedImages.map(async (item, index) => {
                    let result = await cloudinary.uploader.upload(item.file.path, { resource_type: 'image' });
                    return {
                        url: result.secure_url,
                        order: (imagesUrl.length || 0) + index + 1, // Append order
                        color: item.color
                    }
                })
            )
            imagesUrl = [...imagesUrl, ...newImages];
        }

        const stockData = stockByVariant ? JSON.parse(stockByVariant) : {};
        const priceData = req.body.variantPrices ? JSON.parse(req.body.variantPrices) : {};
        const titleData = req.body.colorTitles ? JSON.parse(req.body.colorTitles) : {};
        const defaultColor = req.body.defaultListingColor || null; // NEW: default listing color

        // Reconstruct variants
        const sizesArray = JSON.parse(sizes);
        const colorsArray = colors ? JSON.parse(colors) : [];
        const variants = [];
        let minPrice = Number(price) || Infinity;

        for (const size of sizesArray) {
            for (const color of colorsArray) {
                const variantKey = `${size}-${color}`;
                const variantStock = stockData[variantKey] || 0;
                const variantPrice = priceData[variantKey] || Number(price);
                const variantTitle = titleData[color] || title;

                if (variantPrice < minPrice) {
                    minPrice = variantPrice;
                }

                // Generate SKU
                const baseSKU = generateSKU(title, color, size);

                // Get variant-specific images
                const variantImages = imagesUrl
                    .filter(img => img.color === color || img.color === null)
                    .map(({ url, order }) => ({ url, order }));

                variants.push({
                    sku: baseSKU,
                    size,
                    color,
                    price: variantPrice,
                    stock: variantStock,
                    variantTitle,
                    isListingVariant: color === defaultColor, // NEW: Set flag
                    images: variantImages
                });
            }
        }

        const updateData = {
            title,
            name: title,
            description,
            category,
            price: Number(price),
            basePrice: minPrice !== Infinity ? minPrice : Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            subCategory,
            brand: brand || "",
            bestseller: bestseller === "true",
            isActive: isActive === "true",
            isFeatured: isFeatured === "true",
            sizes: sizesArray,
            colors: colorsArray,
            variants: variants,
            stockByVariant: stockData,
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