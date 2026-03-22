import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { useNotification } from "./NotificationContext";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        // Restore guest cart from localStorage on first render
        try {
            const saved = localStorage.getItem('guestCart');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('')
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingWishlistId, setPendingWishlistId] = useState(null);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const navigate = useNavigate();
    const { show } = useNotification();

    // Determine if a product has any stock available (across variants or legacy stock map)
    const isProductInStock = (product) => {
        if (!product) return false;

        // New model: variants with stock
        if (product.variants && product.variants.length > 0) {
            return product.variants.some(v => {
                if (!v) return false;
                const stock = Number(v.stock);
                if (!Number.isNaN(stock)) {
                    return stock > 0;
                }
                return Boolean(v.stock);
            });
        }

        // Legacy model: stockByVariant map
        const stockByVariant = product.stockByVariant;
        if (stockByVariant) {
            const values = stockByVariant instanceof Map
                ? Array.from(stockByVariant.values())
                : Object.values(stockByVariant);
            return values.some(v => Number(v) > 0);
        }

        // If no stock data is present, don't hide the product
        return true;
    };

    const inStockProducts = products.filter(isProductInStock);


    const addToCart = async (itemId, sizeOrVariantId, color) => {

        // Determine if using new model (variantId) or old model (size + color)
        const isNewModel = sizeOrVariantId && sizeOrVariantId.length === 24; // MongoDB ObjectId is 24 chars

        // Find the product
        const product = products.find(p => p._id === itemId);

        if (isNewModel) {
            // NEW MODEL: Using variantId
            const variantId = sizeOrVariantId;

            let cartData = structuredClone(cartItems) || {};

            if (cartData[itemId]) {
                if (cartData[itemId][variantId]) {
                    cartData[itemId][variantId] += 1;
                } else {
                    cartData[itemId][variantId] = 1;
                }
            } else {
                cartData[itemId] = {};
                cartData[itemId][variantId] = 1;
            }
            setCartItems(cartData);

            if (token) {
                try {
                    await axios.post(backendUrl + '/api/cart/add', { itemId, variantId }, { headers: { token } })
                } catch (error) {
                    console.log(error);
                    show(error.message, 'error');
                }
            }

            setShowMiniCart(true);

        } else {
            // OLD MODEL: Using size + color
            const size = sizeOrVariantId;

            if (!size) {
                return { needsSizeSelection: true };
            }

            // Validate color selection if product has colors
            if (product && product.colors && product.colors.length > 0 && !color) {
                show('Select Product Color', 'error');
                return;
            }

            let cartData = structuredClone(cartItems) || {};

            // Create variant key based on size and color
            const variantKey = color ? `${size}-${color}` : size;

            if (cartData[itemId]) {
                if (cartData[itemId][variantKey]) {
                    cartData[itemId][variantKey] += 1;
                }
                else {
                    cartData[itemId][variantKey] = 1;
                }
            }
            else {
                cartData[itemId] = {};
                cartData[itemId][variantKey] = 1;
            }
            setCartItems(cartData);

            if (token) {
                try {
                    await axios.post(backendUrl + '/api/cart/add', { itemId, size, color }, { headers: { token } })
                } catch (error) {
                    console.log(error);
                    show(error.message, 'error');
                }
            }
        }

        setShowMiniCart(true);
    }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, variantKey, quantity) => {

        let cartData = structuredClone(cartItems) || {};

        // Update local state
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        if (quantity === 0) {
            // Remove item from local cart
            delete cartData[itemId][variantKey];
            // Remove product entry if no variants left
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][variantKey] = quantity;
        }

        setCartItems(cartData);

        if (token) {
            try {
                // Determine if variantKey is a variantId (24-char ObjectId) or size-color string
                const isVariantId = variantKey.length === 24 && !variantKey.includes('-');

                if (isVariantId) {
                    // NEW MODEL: Send variantId
                    await axios.post(backendUrl + '/api/cart/update', {
                        itemId,
                        variantId: variantKey,
                        quantity
                    }, { headers: { token } });
                } else {
                    // OLD MODEL: Parse variant key to extract size and color
                    const parts = variantKey.split('-');
                    const size = parts[0];
                    const color = parts.length > 1 ? parts.slice(1).join('-') : null;

                    await axios.post(backendUrl + '/api/cart/update', {
                        itemId,
                        size,
                        color,
                        quantity
                    }, { headers: { token } });
                }

            } catch (error) {
                console.log(error);
                show(error.message, 'error');
            }
        }

    }

    const getCartAmount = async () => {
        // Fetch backend cart to get variant-specific prices
        if (!token) {
            // Fallback to old method for non-logged-in users
            let totalAmount = 0;
            for (const items in cartItems) {
                let itemInfo = products.find((product) => product._id === items);
                for (const item in cartItems[items]) {
                    try {
                        if (cartItems[items][item] > 0) {
                            // Check if item is a variantId (24 chars) or size-color key
                            const isVariantId = item.length === 24;
                            let price = 0;

                            if (isVariantId && itemInfo?.variants) {
                                // Find variant price
                                const variant = itemInfo.variants.find(v => v._id.toString() === item);
                                price = variant ? variant.price : (itemInfo.discountPrice || itemInfo.price || 0);
                            } else {
                                // Use base product price for old model
                                price = itemInfo?.discountPrice || itemInfo?.price || 0;
                            }

                            totalAmount += price * cartItems[items][item];
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            return totalAmount;
        }

        // For logged-in users, use backend cart with variant prices
        try {
            const backendCart = await getBackendCartItems();
            let totalAmount = 0;
            backendCart.forEach(item => {
                totalAmount += item.price * item.quantity;
            });
            return totalAmount;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const getProductsData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                show(response.data.message, 'error')
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error')
        } finally {
            setLoading(false);
        }
    }

    const getUserWishlist = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/wishlist/get', {}, { headers: { token } })
            if (response.data.success) {
                const productIds = response.data.products.map(p => p._id);
                setWishlist(productIds);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const addToWishlist = async (productId) => {
        if (!token) {
            setPendingWishlistId(productId);
            setShowLoginModal(true);
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/wishlist/add', { productId }, { headers: { token } })
            if (response.data.success) {
                setWishlist(prev => [...prev, productId]);
                show('Added to wishlist', 'success');
            } else {
                show(response.data.message, 'error');
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error');
        }
    }

    const removeFromWishlist = async (productId) => {
        try {
            const response = await axios.post(backendUrl + '/api/wishlist/remove', { productId }, { headers: { token } })
            if (response.data.success) {
                setWishlist(prev => prev.filter(id => id !== productId));
                show('Removed from wishlist', 'success');
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error');
        }
    }

    const getWishlistCount = () => {
        return wishlist.length;
    }

    // Get cart items from backend with variant prices and images
    const getBackendCartItems = async () => {
        if (!token) return [];

        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
            if (response.data.success && response.data.cart) {
                return response.data.cart.items || [];
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    }

    const getUserCart = async (token) => {
        try {

            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error')
        }
    }

    // Persist guest cart to localStorage; clear it when logged in
    useEffect(() => {
        if (!token) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems));
        }
    }, [cartItems, token]);

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
            getUserWishlist(localStorage.getItem('token'))
        }
        if (token) {
            // Clear guest cart from localStorage when logged in
            localStorage.removeItem('guestCart');
            getUserCart(token)
            getUserWishlist(token)
        }
    }, [token])

    const value = {
        products, inStockProducts, currency, delivery_fee, loading,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        wishlist, addToWishlist, removeFromWishlist, getWishlistCount,
        getBackendCartItems,
        getUserCart,
        showLoginModal, setShowLoginModal,
        pendingWishlistId, setPendingWishlistId,
        showMiniCart, setShowMiniCart,
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;