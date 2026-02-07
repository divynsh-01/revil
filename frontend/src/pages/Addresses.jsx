import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Addresses = () => {
    const { backendUrl, token, navigate } = useContext(ShopContext);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Fetch addresses
    const fetchAddresses = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/address/list', {}, { headers: { token } });
            if (response.data.success) {
                setAddresses(response.data.addresses);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAddresses();
        } else {
            navigate('/login');
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                // Update existing address
                const response = await axios.post(backendUrl + '/api/address/update',
                    { addressId: editingId, ...formData },
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Address updated successfully');
                    fetchAddresses();
                    resetForm();
                }
            } else {
                // Add new address
                const response = await axios.post(backendUrl + '/api/address/add',
                    formData,
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Address added successfully');
                    fetchAddresses();
                    resetForm();
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleEdit = (address) => {
        setFormData({
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault
        });
        setEditingId(address._id);
        setShowForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await axios.post(backendUrl + '/api/address/delete',
                { addressId },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Address deleted successfully');
                fetchAddresses();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await axios.post(backendUrl + '/api/address/set-default',
                { addressId },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Default address updated');
                fetchAddresses();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className='border-t pt-16'>
            <div className='text-2xl mb-8'>
                <Title text1={'MY'} text2={'ADDRESSES'} />
            </div>

            <button
                onClick={() => setShowForm(!showForm)}
                className='bg-black text-white px-8 py-3 text-sm mb-8'
            >
                {showForm ? 'CANCEL' : '+ ADD NEW ADDRESS'}
            </button>

            {/* Address Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className='mb-8 border p-6 max-w-2xl'>
                    <h3 className='text-xl mb-4'>{editingId ? 'Edit Address' : 'Add New Address'}</h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder='Full Name'
                            className='border px-3 py-2'
                            required
                        />
                        <input
                            type='tel'
                            name='phone'
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder='Phone Number'
                            className='border px-3 py-2'
                            required
                        />
                    </div>

                    <input
                        type='text'
                        name='addressLine1'
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder='Address Line 1'
                        className='border px-3 py-2 w-full mt-4'
                        required
                    />

                    <input
                        type='text'
                        name='addressLine2'
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        placeholder='Address Line 2 (Optional)'
                        className='border px-3 py-2 w-full mt-4'
                    />

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                        <input
                            type='text'
                            name='city'
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder='City'
                            className='border px-3 py-2'
                            required
                        />
                        <input
                            type='text'
                            name='state'
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder='State'
                            className='border px-3 py-2'
                            required
                        />
                        <input
                            type='text'
                            name='pincode'
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder='Pincode'
                            className='border px-3 py-2'
                            required
                        />
                    </div>

                    <div className='flex items-center gap-2 mt-4'>
                        <input
                            type='checkbox'
                            name='isDefault'
                            checked={formData.isDefault}
                            onChange={handleInputChange}
                            id='isDefault'
                        />
                        <label htmlFor='isDefault'>Set as default address</label>
                    </div>

                    <div className='flex gap-4 mt-6'>
                        <button type='submit' className='bg-black text-white px-8 py-2 text-sm'>
                            {editingId ? 'UPDATE' : 'SAVE'}
                        </button>
                        <button type='button' onClick={resetForm} className='border px-8 py-2 text-sm'>
                            CANCEL
                        </button>
                    </div>
                </form>
            )}

            {/* Address List */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {addresses.map((address) => (
                    <div key={address._id} className={`border p-4 ${address.isDefault ? 'border-black border-2' : ''}`}>
                        {address.isDefault && (
                            <span className='bg-black text-white text-xs px-2 py-1 mb-2 inline-block'>DEFAULT</span>
                        )}
                        <p className='font-medium'>{address.name}</p>
                        <p className='text-sm text-gray-600'>{address.phone}</p>
                        <p className='text-sm mt-2'>{address.addressLine1}</p>
                        {address.addressLine2 && <p className='text-sm'>{address.addressLine2}</p>}
                        <p className='text-sm'>{address.city}, {address.state} - {address.pincode}</p>

                        <div className='flex gap-4 mt-4'>
                            <button
                                onClick={() => handleEdit(address)}
                                className='text-sm text-blue-600 hover:underline'
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(address._id)}
                                className='text-sm text-red-600 hover:underline'
                            >
                                Delete
                            </button>
                            {!address.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(address._id)}
                                    className='text-sm text-green-600 hover:underline'
                                >
                                    Set as Default
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {addresses.length === 0 && !showForm && (
                <p className='text-gray-500 text-center py-10'>No addresses saved. Add your first address!</p>
            )}
        </div>
    );
};

export default Addresses;
