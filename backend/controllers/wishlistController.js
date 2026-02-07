import wishlistModel from "../models/wishlistModel.js";

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            // Create new wishlist if doesn't exist
            wishlist = new wishlistModel({
                userId,
                products: [productId]
            });
        } else {
            // Check if product already in wishlist
            if (wishlist.products.includes(productId)) {
                return res.json({ success: false, message: "Product already in wishlist" });
            }
            wishlist.products.push(productId);
        }

        await wishlist.save();
        res.json({ success: true, message: "Added to wishlist" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.json({ success: false, message: "Wishlist not found" });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        res.json({ success: true, message: "Removed from wishlist" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        const wishlist = await wishlistModel.findOne({ userId }).populate('products');

        if (!wishlist) {
            return res.json({ success: true, products: [] });
        }

        res.json({ success: true, products: wishlist.products });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        await wishlistModel.findOneAndUpdate({ userId }, { products: [] });

        res.json({ success: true, message: "Wishlist cleared" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToWishlist, removeFromWishlist, getWishlist, clearWishlist };
