import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Colors = ({ token }) => {
    const [colors, setColors] = useState([]);
    const [newColor, setNewColor] = useState("");
    const [newHex, setNewHex] = useState("");

    // Fetch colors
    const fetchColors = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/color/list');
            if (response.data.success) {
                setColors(response.data.colors);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchColors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/color/add',
                { name: newColor, hexCode: newHex },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Color added successfully');
                setNewColor("");
                setNewHex("");
                fetchColors();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this color?')) return;
        try {
            const response = await axios.post(backendUrl + '/api/color/delete',
                { id },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Color deleted successfully');
                fetchColors();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-6'>Color Management</h2>

            <form onSubmit={handleSubmit} className='mb-8 border p-6 max-w-lg bg-white shadow-sm'>
                <h3 className='text-xl mb-4 font-medium'>Add New Color</h3>
                <div className='flex flex-col gap-4'>
                    <div>
                        <label className='block mb-2 text-sm'>Color Name</label>
                        <input
                            type='text'
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            placeholder='e.g., Navy Blue'
                            className='border px-3 py-2 w-full'
                            required
                        />
                    </div>
                    <div>
                        <label className='block mb-2 text-sm'>Hex Code (Optional)</label>
                        <div className='flex items-center gap-2'>
                            <input
                                type='text'
                                value={newHex}
                                onChange={(e) => setNewHex(e.target.value)}
                                placeholder='e.g., #000080'
                                className='border px-3 py-2 w-full'
                            />
                            <input
                                type="color"
                                value={newHex || "#000000"}
                                onChange={(e) => setNewHex(e.target.value)}
                                className='h-10 w-10 border cursor-pointer'
                            />
                        </div>
                    </div>
                    <button type='submit' className='bg-black text-white px-6 py-2 mt-2 w-full'>
                        SAVE COLOR
                    </button>
                </div>
            </form>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {colors.map((color) => (
                    <div key={color._id} className='border p-3 flex flex-col items-center justify-between bg-white relative group'>
                        <div
                            className='w-16 h-16 rounded-full border mb-2 shadow-sm'
                            style={{ backgroundColor: color.hexCode || color.name }}
                        ></div>
                        <p className='font-medium text-center'>{color.name}</p>
                        {color.hexCode && <p className='text-xs text-gray-500 uppercase'>{color.hexCode}</p>}

                        <button
                            onClick={() => handleDelete(color._id)}
                            className='text-red-500 text-xs mt-2 hover:underline'
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            {colors.length === 0 && (
                <p className='text-gray-500 py-10'>No colors added yet.</p>
            )}
        </div>
    );
};

export default Colors;
