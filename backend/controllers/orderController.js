import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import cartModel from "../models/cartModel.js";
import addressModel from "../models/addressModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 0 // Free shipping for now

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Generate unique order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
};

// Placing orders using COD Method
const placeOrder = async (req, res) => {

    try {

        const { userId, items, addressId, discount } = req.body;

        // Get address
        const address = await addressModel.findById(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        // Calculate pricing
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = deliveryCharge;
        const discountAmount = discount || 0;
        const total = subtotal + shipping - discountAmount;

        const orderData = {
            orderId: generateOrderId(),
            userId,
            items: items.map(item => ({
                productId: item.productId,
                title: item.title,
                image: item.image,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            })),
            pricing: {
                subtotal,
                shipping,
                discount: discountAmount,
                total
            },
            payment: {
                method: "COD",
                status: "pending"
            },
            shippingAddress: {
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            orderStatus: "Order Placed"
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Clear cart
        await cartModel.findOneAndUpdate({ userId }, { items: [] })

        res.json({ success: true, message: "Order Placed", orderId: newOrder.orderId })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {

        const { userId, items, addressId, discount } = req.body
        const { origin } = req.headers;

        // Get address
        const address = await addressModel.findById(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        // Calculate pricing
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = deliveryCharge;
        const discountAmount = discount || 0;
        const total = subtotal + shipping - discountAmount;

        const orderData = {
            orderId: generateOrderId(),
            userId,
            items: items.map(item => ({
                productId: item.productId,
                title: item.title,
                image: item.image,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            })),
            pricing: {
                subtotal,
                shipping,
                discount: discountAmount,
                total
            },
            payment: {
                method: "Stripe",
                status: "pending"
            },
            shippingAddress: {
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            orderStatus: "Order Placed"
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.title
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        if (shipping > 0) {
            line_items.push({
                price_data: {
                    currency: currency,
                    product_data: {
                        name: 'Delivery Charges'
                    },
                    unit_amount: shipping * 100
                },
                quantity: 1
            })
        }

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Verify Stripe 
const verifyStripe = async (req, res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {
                "payment.status": "paid"
            });
            await cartModel.findOneAndUpdate({ userId }, { items: [] })
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {

        const { userId, items, addressId, discount } = req.body

        // Get address
        const address = await addressModel.findById(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        // Calculate pricing
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = deliveryCharge;
        const discountAmount = discount || 0;
        const total = subtotal + shipping - discountAmount;

        const orderData = {
            orderId: generateOrderId(),
            userId,
            items: items.map(item => ({
                productId: item.productId,
                title: item.title,
                image: item.image,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            })),
            pricing: {
                subtotal,
                shipping,
                discount: discountAmount,
                total
            },
            payment: {
                method: "Razorpay",
                status: "pending"
            },
            shippingAddress: {
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            orderStatus: "Order Placed"
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: total * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return res.json({ success: false, message: error })
            }
            res.json({ success: true, order })
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res) => {
    try {

        const { userId, razorpay_order_id } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {
                "payment.status": "paid",
                "payment.paymentId": razorpay_order_id
            });
            await cartModel.findOneAndUpdate({ userId }, { items: [] })
            res.json({ success: true, message: "Payment Successful" })
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// All Orders data for Admin Panel
const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find({}).populate('userId', 'email').sort({ createdAt: -1 })

        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {

        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { orderStatus: status })
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update tracking information
const updateTracking = async (req, res) => {
    try {

        const { orderId, courier, trackingId, trackingUrl } = req.body

        await orderModel.findByIdAndUpdate(orderId, {
            "tracking.courier": courier,
            "tracking.trackingId": trackingId,
            "tracking.trackingUrl": trackingUrl || ""
        })

        res.json({ success: true, message: 'Tracking Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get single order by orderId
const getOrder = async (req, res) => {
    try {

        const { orderId } = req.body

        const order = await orderModel.findOne({ orderId })

        if (!order) {
            return res.json({ success: false, message: "Order not found" })
        }

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getStatuses = async (req, res) => {
    try {
        const { ORDER_STATUS_DETAILS } = await import('../config/orderStatus.js');
        res.json({ success: true, statusList: ORDER_STATUS_DETAILS });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, updateTracking, getOrder, getStatuses }