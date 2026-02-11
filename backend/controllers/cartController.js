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

        // Convert cart items array to frontend format (nested object) for backward compatibility
        const cartData = {};

        // Enrich cart items with current stock info
        const enrichedItems = [];

        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            let currentStock = 0;

            if (product) {
                if (item.variantId) {
                    const variant = product.variants.id(item.variantId);
                    currentStock = variant ? variant.stock : 0;
                } else {
                    // For old model or simple products, we might not have precise stock tracking, 
                    // but let's try to infer or default to a safe number if not tracked strictly.
                    // If the product has no variants, maybe check specific size logic if implemented, 
                    // otherwise default to arbitrary high number or 0 if strict.
                    // For now, let's assume if no variantId, we check if it's a simple product.
                    // If the product schema has a top-level stock (not shown in previous view_file), use it.
                    // Based on view_file, productModel has `stock` inside variants. 
                    // Old `stockByVariant` is map.
                    if (product.stockByVariant && product.stockByVariant.get(item.size)) {
                        currentStock = product.stockByVariant.get(item.size);
                    } else {
                        // Fallback: if we can't determine stock, allow it (or set to 0 to disable?)
                        // Let's allow it for now to avoid breaking old items, but max 100
                        currentStock = 100;
                    }
                }
            }

            // Add stock to the item object for frontend
            const itemObj = item.toObject();
            itemObj.stock = currentStock;
            enrichedItems.push(itemObj);

            const productId = item.productId.toString();
            if (!cartData[productId]) {
                cartData[productId] = {};
            }
            // Use variantId or size-color key
            const key = item.variantId ? item.variantId.toString() : (item.color ? `${item.size}-${item.color}` : item.size);
            cartData[productId][key] = item.quantity;
        }

        // Return both cartData (for compatibility) and cart object with enriched items (for Cart.jsx)
        // We replace items with enrichedItems in the response
        const cartResponse = cart.toObject();
        cartResponse.items = enrichedItems;

        res.json({ success: true, cartData, cart: cartResponse });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update cart (add/update/remove items)
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, variantId, size, color, quantity } = req.body;

        // Get product details
        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({ userId, items: [] });
        }

        let itemSize = size;
        let itemColor = color;
        let itemPrice = product.discountPrice || product.price;
        let itemImage = product.images?.[0]?.url || product.images?.[0] || product.image?.[0] || "";
        let availableStock = 0;

        // If variantId provided, get variant data
        let itemTitle = product.title || product.name;

        if (variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.id(variantId);
            if (variant) {
                itemSize = variant.size;
                itemColor = variant.color;
                itemPrice = variant.price;
                availableStock = variant.stock;
                if (variant.variantTitle) {
                    itemTitle = variant.variantTitle;
                }
                // Get variant-specific image
                if (variant.images && variant.images.length > 0) {
                    itemImage = variant.images[0].url;
                }
            }
        } else {
            // Fallback logic for stock if no variantId (simplified)
            availableStock = 100;
        }

        // Validate Quantity
        if (quantity > availableStock) {
            return res.json({ success: false, message: `Only ${availableStock} items in stock` });
        }

        // Find existing item (match by variantId OR size+color)
        let existingItemIndex;
        if (variantId) {
            existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === itemId &&
                    item.variantId && item.variantId.toString() === variantId
            );
        } else {
            existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === itemId &&
                    item.size === itemSize &&
                    (item.color || null) === (itemColor || null)
            );
        }

        if (quantity > 0) {
            // Update or add item
            const cartItem = {
                productId: itemId,
                variantId: variantId || null,
                title: itemTitle,
                price: itemPrice,
                image: itemImage,
                size: itemSize,
                color: itemColor || null,
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
        const { userId, itemId, variantId, size, color, quantity } = req.body;

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

        let itemSize = size;
        let itemColor = color;
        let itemPrice = productData.discountPrice || productData.price || 0;
        let itemVariantId = variantId;

        // NEW MODEL: If variantId is provided, extract data from variant
        if (variantId && productData.variants && productData.variants.length > 0) {
            const variant = productData.variants.id(variantId);
            if (variant) {
                itemSize = variant.size;
                itemColor = variant.color;
                itemPrice = variant.price;
            } else {
                return res.json({ success: false, message: "Variant not found" });
            }
        }

        // Check if item already exists (match by productId and variantId OR size+color)
        let existingItemIndex;
        if (variantId) {
            existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId &&
                    item.variantId && item.variantId.toString() === variantId
            );
        } else {
            existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId &&
                    item.size === itemSize &&
                    (item.color || null) === (itemColor || null)
            );
        }

        if (existingItemIndex > -1) {
            console.log("Updating existing item quantity");
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            console.log("Adding new item to cart");

            // Handle image field safely
            let image = "";

            // Try to get variant-specific image if available
            if (variantId && productData.variants && productData.variants.length > 0) {
                const variant = productData.variants.id(variantId);
                if (variant && variant.images && variant.images.length > 0) {
                    image = variant.images[0].url;
                }
            }

            // Fallback to product images
            if (!image) {
                if (productData.images && productData.images.length > 0) {
                    image = productData.images[0].url || productData.images[0];
                } else if (productData.image && productData.image.length > 0) {
                    image = productData.image[0];
                }
            }

            // Try to get variant-specific content
            let itemTitle = productData.title || productData.name || "Unknown Product";

            if (variantId && productData.variants && productData.variants.length > 0) {
                const variant = productData.variants.id(variantId);
                if (variant) {
                    if (variant.variantTitle) {
                        itemTitle = variant.variantTitle;
                    }
                }
            }

            cart.items.push({
                productId,
                variantId: itemVariantId || null,
                title: itemTitle,
                price: itemPrice,
                image: image,
                size: itemSize,
                color: itemColor || null,
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