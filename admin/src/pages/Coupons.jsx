import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Coupons = ({ token }) => {
    const [coupons, setCoupons] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        expiryDate: '',
        usageLimit: '',
        description: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, [token]);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/coupon/list', { headers: { token } });
            if (response.data.success) {
                setCoupons(response.data.coupons);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch coupons');
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingCoupon
                ? `${backendUrl}/api/coupon/update/${editingCoupon._id}`
                : `${backendUrl}/api/coupon/create`;

            const method = editingCoupon ? 'put' : 'post';

            const response = await axios[method](url, formData, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchCoupons();
                resetForm();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Operation failed');
        }
    }

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount || '',
            expiryDate: coupon.expiryDate.split('T')[0],
            usageLimit: coupon.usageLimit || '',
            description: coupon.description || ''
        });
        setShowForm(true);
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const response = await axios.delete(`${backendUrl}/api/coupon/delete/${id}`, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCoupons();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to delete coupon');
        }
    }

    const handleToggleStatus = async (id) => {
        try {
            const response = await axios.put(`${backendUrl}/api/coupon/toggle/${id}`, {}, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCoupons();
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to toggle status');
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            minOrderValue: '',
            maxDiscount: '',
            expiryDate: '',
            usageLimit: '',
            description: ''
        });
        setEditingCoupon(null);
        setShowForm(false);
    }

    const generateRandomCode = () => {
        const code = 'SAVE' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData(prev => ({ ...prev, code }));
    }

    return (
        <div className='w-full max-w-7xl mx-auto'>
            {/* Header */}
            <div className='flex justify-between items-center mb-8'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-800'>Coupon Management</h1>
                    <p className='text-gray-600 mt-1'>Create and manage discount coupons</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2'
                >
                    {showForm ? (
                        <>
                            <span>✕</span> Cancel
                        </>
                    ) : (
                        <>
                            <span>+</span> Create Coupon
                        </>
                    )}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className='bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200'>
                    <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
                        {editingCoupon ? '✏️ Edit Coupon' : '✨ Create New Coupon'}
                    </h2>
                    <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Coupon Code *</label>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    name='code'
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    className='border-2 border-gray-300 rounded-lg px-4 py-2.5 flex-1 uppercase focus:border-blue-500 focus:outline-none transition-colors'
                                    placeholder='SAVE20'
                                />
                                <button
                                    type='button'
                                    onClick={generateRandomCode}
                                    className='border-2 border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors font-medium'
                                >
                                    🎲 Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Discount Type *</label>
                            <select
                                name='type'
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                            >
                                <option value='percentage'>Percentage (%)</option>
                                <option value='fixed'>Fixed Amount ($)</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>
                                Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                            </label>
                            <input
                                type='number'
                                name='value'
                                value={formData.value}
                                onChange={handleInputChange}
                                required
                                min='0'
                                step='0.01'
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                                placeholder={formData.type === 'percentage' ? '20' : '50'}
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Min Order Value ($)</label>
                            <input
                                type='number'
                                name='minOrderValue'
                                value={formData.minOrderValue}
                                onChange={handleInputChange}
                                min='0'
                                step='0.01'
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                                placeholder='0 (No minimum)'
                            />
                        </div>

                        {formData.type === 'percentage' && (
                            <div>
                                <label className='block text-sm font-semibold mb-2 text-gray-700'>Max Discount Cap ($)</label>
                                <input
                                    type='number'
                                    name='maxDiscount'
                                    value={formData.maxDiscount}
                                    onChange={handleInputChange}
                                    min='0'
                                    step='0.01'
                                    className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                                    placeholder='100 (Optional)'
                                />
                            </div>
                        )}

                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Expiry Date *</label>
                            <input
                                type='date'
                                name='expiryDate'
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                required
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Usage Limit</label>
                            <input
                                type='number'
                                name='usageLimit'
                                value={formData.usageLimit}
                                onChange={handleInputChange}
                                min='1'
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                                placeholder='Unlimited'
                            />
                        </div>

                        <div className='md:col-span-2'>
                            <label className='block text-sm font-semibold mb-2 text-gray-700'>Description (Optional)</label>
                            <textarea
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                className='border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:border-blue-500 focus:outline-none transition-colors'
                                rows='3'
                                placeholder='e.g., Summer sale discount for new customers'
                            />
                        </div>

                        <div className='md:col-span-2 flex gap-3'>
                            <button
                                type='submit'
                                className='bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md font-semibold'
                            >
                                {editingCoupon ? '💾 Update Coupon' : '✨ Create Coupon'}
                            </button>
                            {editingCoupon && (
                                <button
                                    type='button'
                                    onClick={resetForm}
                                    className='border-2 border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold'
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                            <tr>
                                <th className='text-left p-4 font-semibold text-gray-700'>Code</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Type</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Value</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Min Order</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Usage</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Expiry</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Status</th>
                                <th className='text-left p-4 font-semibold text-gray-700'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => {
                                const isExpired = new Date(coupon.expiryDate) < new Date();
                                const usagePercent = coupon.usageLimit
                                    ? (coupon.usedCount / coupon.usageLimit) * 100
                                    : 0;

                                return (
                                    <tr key={index} className='border-t border-gray-200 hover:bg-gray-50 transition-colors'>
                                        <td className='p-4'>
                                            <span className='font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md'>
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className='p-4 capitalize'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.type === 'percentage'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {coupon.type}
                                            </span>
                                        </td>
                                        <td className='p-4 font-semibold'>
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                            {coupon.maxDiscount && (
                                                <div className='text-xs text-gray-500 mt-1'>max ${coupon.maxDiscount}</div>
                                            )}
                                        </td>
                                        <td className='p-4'>${coupon.minOrderValue}</td>
                                        <td className='p-4'>
                                            <div className='flex flex-col gap-1'>
                                                <span className='font-semibold'>
                                                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                                </span>
                                                {coupon.usageLimit && (
                                                    <div className='w-full bg-gray-200 rounded-full h-2'>
                                                        <div
                                                            className={`h-2 rounded-full ${usagePercent >= 90 ? 'bg-red-500' :
                                                                    usagePercent >= 70 ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                                }`}
                                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex flex-col'>
                                                <span>{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                                {isExpired && (
                                                    <span className='text-red-500 text-xs font-semibold mt-1'>⚠️ Expired</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <button
                                                onClick={() => handleToggleStatus(coupon._id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${coupon.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {coupon.isActive ? '✓ Active' : '✕ Inactive'}
                                            </button>
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className='text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 hover:bg-blue-50 rounded transition-colors'
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className='text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-1 hover:bg-red-50 rounded transition-colors'
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <div className='text-center py-16'>
                            <div className='text-6xl mb-4'>🎟️</div>
                            <h3 className='text-xl font-semibold text-gray-700 mb-2'>No coupons yet</h3>
                            <p className='text-gray-500 mb-6'>Create your first coupon to start offering discounts</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                            >
                                + Create First Coupon
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Coupons;
