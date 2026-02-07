import express from 'express'
import cors from 'cors'
import 'dotenv/config'
console.log("Mongo URI =", process.env.MONGODB_URI)
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import addressRouter from './routes/addressRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import wishlistRouter from './routes/wishlistRoute.js'
import couponRouter from './routes/couponRoute.js'
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/address', addressRouter)
app.use('/api/category', categoryRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/coupon', couponRouter)

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))