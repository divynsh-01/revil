import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// Get user cart
const getCart = async (req, res) => {
    try {
        const { userId } = req.body;

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({ userId, items: [] });
            await cart.save();
        }

        // Convert cart items array to frontend format (nested object)
        const cartData = {};
        cart.items.forEach(item => {
            const productId = item.productId.toString();
            if (!cartData[productId]) {
                cartData[productId] = {};
            }
            cartData[productId][item.size] = item.quantity;
        });

        res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update cart (add/update/remove items)
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        // Get product details
        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({ userId, items: [] });
        }

        // Find existing item
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === itemId && item.size === size
        );

        if (quantity > 0) {
            // Update or add item
            const cartItem = {
                productId: itemId,
                title: product.title || product.name,
                price: product.discountPrice || product.price,
                image: product.images?.[0]?.url || product.images?.[0] || product.image?.[0] || "",
                size,
                quantity
            };

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex] = cartItem;
            } else {
                cart.items.push(cartItem);
            }
        } else {
            // Remove item if quantity is 0
            if (existingItemIndex > -1) {
                cart.items.splice(existingItemIndex, 1);
            }
        }

        await cart.save();

        res.json({ success: true, message: "Cart updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add single item to cart
const addToCart = async (req, res) => {
    try {
        console.log("Add to cart request body:", req.body);
        const { userId, itemId, size, quantity } = req.body;

        const productId = itemId;
        const productData = await productModel.findById(productId);

        if (!productData) {
            console.log("Product not found:", productId);
            return res.json({ success: false, message: "Product not found" });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            console.log("Creating new cart for user:", userId);
            cart = new cartModel({ userId, items: [] });
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            console.log("Updating existing item quantity");
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            console.log("Adding new item to cart");

            // Handle image field safely
            let image = "";
            if (productData.images && productData.images.length > 0) {
                image = productData.images[0].url || productData.images[0];
            } else if (productData.image && productData.image.length > 0) {
                image = productData.image[0];
            }

            cart.items.push({
                productId,
                title: productData.title || productData.name || "Unknown Product",
                price: productData.discountPrice || productData.price || 0,
                image: image,
                size,
                quantity: quantity || 1
            });
        }

        await cart.save();
        console.log("Cart saved successfully");

        res.json({ success: true, message: "Item added to cart" });

    } catch (error) {
        console.log("Error in addToCart:", error);
        res.json({ success: false, message: error.message });
    }
};


// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, productId, size } = req.body;

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            item => !(item.productId.toString() === productId && item.size === size)
        );

        await cart.save();

        res.json({ success: true, message: "Item removed from cart", cart });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const { userId } = req.body;

        await cartModel.findOneAndUpdate({ userId }, { items: [] });

        res.json({ success: true, message: "Cart cleared" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user cart (legacy support)
const getUserCart = async (req, res) => {
    return getCart(req, res);
};

export { getCart, updateCart, addToCart, removeFromCart, clearCart, getUserCart };