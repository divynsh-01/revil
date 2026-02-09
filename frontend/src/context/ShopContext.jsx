import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('')
    const navigate = useNavigate();


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
                    toast.error(error.message);
                }
            }

        } else {
            // OLD MODEL: Using size + color
            const size = sizeOrVariantId;

            if (!size) {
                toast.error('Select Product Size');
                return;
            }

            // Validate color selection if product has colors
            if (product && product.colors && product.colors.length > 0 && !color) {
                toast.error('Select Product Color');
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
                    toast.error(error.message);
                }
            }
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
                toast.error(error.message);
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
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
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
            toast.error('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/wishlist/add', { productId }, { headers: { token } })
            if (response.data.success) {
                setWishlist(prev => [...prev, productId]);
                toast.success('Added to wishlist');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeFromWishlist = async (productId) => {
        try {
            const response = await axios.post(backendUrl + '/api/wishlist/remove', { productId }, { headers: { token } })
            if (response.data.success) {
                setWishlist(prev => prev.filter(id => id !== productId));
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
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
            toast.error(error.message)
        }
    }

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
            getUserCart(token)
            getUserWishlist(token)
        }
    }, [token])

    const value = {
        products, currency, delivery_fee, loading,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        wishlist, addToWishlist, removeFromWishlist, getWishlistCount,
        getBackendCartItems,  // For Cart.jsx to fetch backend cart
        getUserCart  // For refreshing cart state after operations
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;