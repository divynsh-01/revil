import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Categories = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        image: '',
        isActive: true
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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
                // Update existing category
                const response = await axios.post(backendUrl + '/api/category/update',
                    formData,
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Category updated successfully');
                    fetchCategories();
                    resetForm();
                }
            } else {
                // Add new category
                const response = await axios.post(backendUrl + '/api/category/add',
                    formData,
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Category added successfully');
                    fetchCategories();
                    resetForm();
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleEdit = (category) => {
        setFormData({
            categoryId: category.categoryId,
            name: category.name,
            image: category.image || '',
            isActive: category.isActive
        });
        setEditingId(category.categoryId);
        setShowForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await axios.post(backendUrl + '/api/category/delete',
                { categoryId },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Category deleted successfully');
                fetchCategories();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            categoryId: '',
            name: '',
            image: '',
            isActive: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-6'>Category Management</h2>

            <button
                onClick={() => setShowForm(!showForm)}
                className='bg-black text-white px-6 py-2 mb-6'
            >
                {showForm ? 'CANCEL' : '+ ADD NEW CATEGORY'}
            </button>

            {/* Category Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className='mb-8 border p-6 max-w-2xl bg-white'>
                    <h3 className='text-xl mb-4'>{editingId ? 'Edit Category' : 'Add New Category'}</h3>

                    <div className='grid grid-cols-1 gap-4'>
                        <div>
                            <label className='block mb-2 text-sm'>Category ID (e.g., "men", "women")</label>
                            <input
                                type='text'
                                name='categoryId'
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                placeholder='Category ID'
                                className='border px-3 py-2 w-full'
                                required
                                disabled={editingId !== null}
                            />
                        </div>

                        <div>
                            <label className='block mb-2 text-sm'>Category Name</label>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder='Category Name'
                                className='border px-3 py-2 w-full'
                                required
                            />
                        </div>

                        <div>
                            <label className='block mb-2 text-sm'>Image URL (Optional)</label>
                            <input
                                type='text'
                                name='image'
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder='Image URL'
                                className='border px-3 py-2 w-full'
                            />
                        </div>

                        <div className='flex items-center gap-2'>
                            <input
                                type='checkbox'
                                name='isActive'
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                id='isActive'
                            />
                            <label htmlFor='isActive'>Active (visible to users)</label>
                        </div>
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

            {/* Category List */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {categories.map((category) => (
                    <div key={category._id} className='border p-4 bg-white'>
                        <div className='flex justify-between items-start mb-2'>
                            <div>
                                <p className='font-medium text-lg'>{category.name}</p>
                                <p className='text-sm text-gray-600'>ID: {category.categoryId}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>

                        {category.image && (
                            <img src={category.image} alt={category.name} className='w-full h-32 object-cover mb-2' />
                        )}

                        <div className='flex gap-4 mt-4'>
                            <button
                                onClick={() => handleEdit(category)}
                                className='text-sm text-blue-600 hover:underline'
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(category.categoryId)}
                                className='text-sm text-red-600 hover:underline'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !showForm && (
                <p className='text-gray-500 text-center py-10'>No categories yet. Add your first category!</p>
            )}
        </div>
    );
};

export default Categories;
