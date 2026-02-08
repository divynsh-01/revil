import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = ({ token }) => {

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        graphData: []
    })

    const fetchStats = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/dashboard/stats', { headers: { token } })
            if (response.data.success) {
                setStats(response.data.stats)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token) {
            fetchStats()
        }
    }, [token])

    return (
        <div className='w-full'>
            <h3 className='text-3xl font-semibold mb-5'>Dashboard</h3>
            <div className='flex flex-wrap gap-5 mb-10'>

                <div className='flex items-center gap-4 bg-white p-5 min-w-[200px] rounded border border-gray-100 shadow-sm hover:shadow-md transition-all'>
                    <div className='p-3 bg-blue-50 rounded-full'>
                        <img className='w-8' src={assets.order_icon} alt="" />
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-gray-500 font-medium'>Total Orders</p>
                        <p className='text-2xl font-bold text-gray-800'>{stats.totalOrders}</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 bg-white p-5 min-w-[200px] rounded border border-gray-100 shadow-sm hover:shadow-md transition-all'>
                    <div className='p-3 bg-green-50 rounded-full'>
                        <p className='text-2xl font-bold text-green-600'>{currency}</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-gray-500 font-medium'>Total Earnings</p>
                        <p className='text-2xl font-bold text-gray-800'>{currency}{stats.totalRevenue}</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 bg-white p-5 min-w-[200px] rounded border border-gray-100 shadow-sm hover:shadow-md transition-all'>
                    <div className='p-3 bg-pink-50 rounded-full'>
                        <img className='w-8' src={assets.parcel_icon} alt="" />
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-gray-500 font-medium'>Total Products</p>
                        <p className='text-2xl font-bold text-gray-800'>{stats.totalProducts}</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 bg-white p-5 min-w-[200px] rounded border border-gray-100 shadow-sm hover:shadow-md transition-all'>
                    <div className='p-3 bg-purple-50 rounded-full'>
                        <img className='w-8' src={assets.upload_area} alt="" />
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-gray-500 font-medium'>Total Users</p>
                        <p className='text-2xl font-bold text-gray-800'>{stats.totalUsers}</p>
                    </div>
                </div>

            </div>

            <div className='flex flex-col md:flex-row gap-10 w-full'>

                {/* Revenue Chart */}
                <div className='flex-1 bg-white p-5 rounded border border-gray-100 shadow-sm'>
                    <h4 className='text-lg font-semibold mb-4 text-gray-700'>Revenue Trend</h4>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.graphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Chart */}
                <div className='flex-1 bg-white p-5 rounded border border-gray-100 shadow-sm'>
                    <h4 className='text-lg font-semibold mb-4 text-gray-700'>Order Volume</h4>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.graphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="orders" stroke="#8884d8" name="Orders" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Dashboard
