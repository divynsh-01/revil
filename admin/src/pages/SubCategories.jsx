import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const SubCategories = ({ token }) => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isIdManual, setIsIdManual] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        subCategoryId: '',
        categoryId: '',
        name: '',
        isActive: true
    });

    // Helper to generate slug
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '_'); // Replace spaces and non-word chars with underscores
    };

    // Fetch all categories for dropdown
    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) {
                setCategories(response.data.categories);
                if (response.data.categories.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: response.data.categories[0].categoryId }));
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Fetch all sub-categories
    const fetchSubCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/subcategory/list');
            if (response.data.success) {
                setSubCategories(response.data.subCategories);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-generate ID from Name if not in edit mode and ID hasn't been manually set
            if (name === 'name' && !editingId && !isIdManual) {
                newData.subCategoryId = generateSlug(value);
            }

            return newData;
        });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const response = await axios.post(backendUrl + '/api/subcategory/update',
                    formData,
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Sub-Category updated successfully');
                    fetchSubCategories();
                    resetForm();
                } else {
                    toast.error(response.data.message);
                }
            } else {
                // Add
                const response = await axios.post(backendUrl + '/api/subcategory/add',
                    formData,
                    { headers: { token } }
                );
                if (response.data.success) {
                    toast.success('Sub-Category added successfully');
                    fetchSubCategories();
                    resetForm();
                } else {
                    toast.error(response.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleEdit = (subCategory) => {
        setFormData({
            subCategoryId: subCategory.subCategoryId,
            categoryId: subCategory.categoryId,
            name: subCategory.name,
            isActive: subCategory.isActive
        });
        setEditingId(subCategory.subCategoryId);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (subCategoryId) => {
        if (!window.confirm('Are you sure you want to delete this sub-category?')) return;

        try {
            const response = await axios.post(backendUrl + '/api/subcategory/delete',
                { subCategoryId },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Sub-Category deleted successfully');
                fetchSubCategories();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            subCategoryId: '',
            categoryId: categories.length > 0 ? categories[0].categoryId : '',
            name: '',
            isActive: true
        });
        setEditingId(null);
        setIsIdManual(false);
        setShowForm(false);
    };


    // Helper to get category name from ID
    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.categoryId === catId);
        return cat ? cat.name : catId;
    };

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-6'>Sub-Category Management</h2>

            <button
                onClick={() => setShowForm(!showForm)}
                className='bg-black text-white px-6 py-2 mb-6'
            >
                {showForm ? 'CANCEL' : '+ ADD NEW SUB-CATEGORY'}
            </button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className='mb-8 border p-6 max-w-2xl bg-white'>
                    <h3 className='text-xl mb-4'>{editingId ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h3>

                    <div className='grid grid-cols-1 gap-4'>
                        <div>
                            <label className='block mb-2 text-sm'>Parent Category</label>
                            <select
                                name='categoryId'
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                className='border px-3 py-2 w-full'
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.categoryId}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='text-sm'>Sub-Category ID (Unique)</label>
                                {!editingId && (
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type='checkbox'
                                            id='manualSubId'
                                            checked={isIdManual}
                                            onChange={(e) => setIsIdManual(e.target.checked)}
                                            className='cursor-pointer'
                                        />
                                        <label htmlFor='manualSubId' className='text-xs cursor-pointer text-gray-500'>Manual ID</label>
                                    </div>
                                )}
                            </div>
                            <input
                                type='text'
                                name='subCategoryId'
                                value={formData.subCategoryId}
                                onChange={handleInputChange}
                                placeholder='e.g., topwear_men'
                                className={`border px-3 py-2 w-full ${editingId || !isIdManual ? 'bg-gray-100 text-gray-500' : ''}`}
                                required
                                disabled={editingId !== null || !isIdManual}
                            />
                        </div>

                        <div>
                            <label className='block mb-2 text-sm'>Sub-Category Name</label>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder='e.g., Topwear'
                                className='border px-3 py-2 w-full'
                                required
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
                            <label htmlFor='isActive'>Active</label>
                        </div>
                    </div>

                    <div className='flex gap-4 mt-6'>
                        <button type='submit' className='bg-black text-white px-8 py-2 text-sm'>
                            SAVE
                        </button>
                        <button type='button' onClick={resetForm} className='border px-8 py-2 text-sm'>
                            CANCEL
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {subCategories.map((sub, index) => (
                    <div key={index} className='border p-4 bg-white'>
                        <div className='flex justify-between items-start mb-2'>
                            <div>
                                <p className='font-medium text-lg'>{sub.name}</p>
                                <p className='text-sm text-gray-500'>Parent: {getCategoryName(sub.categoryId)}</p>
                                <p className='text-xs text-gray-400'>ID: {sub.subCategoryId}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 ${sub.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {sub.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>

                        <div className='flex gap-4 mt-4'>
                            <button
                                onClick={() => handleEdit(sub)}
                                className='text-sm text-blue-600 hover:underline'
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(sub.subCategoryId)}
                                className='text-sm text-red-600 hover:underline'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {subCategories.length === 0 && !showForm && (
                <p className='text-gray-500 text-center py-10'>No sub-categories yet.</p>
            )}
        </div>
    );
};

export default SubCategories;
