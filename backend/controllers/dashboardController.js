import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Function to get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments({});
        const totalProducts = await productModel.countDocuments({});
        const totalUsers = await userModel.countDocuments({});

        // Calculate total revenue
        // Using aggregate for better performance and to simplify logic
        const revenueAggregation = await orderModel.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } }, // Exclude cancelled orders
            { $group: { _id: null, totalRevenue: { $sum: "$pricing.total" } } }
        ]);

        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // Get daily stats for graphs (last 7 days or more)
        const graphData = await orderModel.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$pricing.total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        console.log("Graph Data Aggregation Result:", JSON.stringify(graphData, null, 2));

        // Format graph data for frontend
        const formattedGraphData = graphData.map(item => ({
            name: item._id, // Date string
            revenue: item.revenue,
            orders: item.orders
        }));

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalRevenue,
                graphData: formattedGraphData
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { getDashboardStats }
