import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Carousel = ({ token }) => {
    const [list, setList] = useState([])
    const [image, setImage] = useState(false)
    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("")
    const [link, setLink] = useState("/collection")
    const [order, setOrder] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const fetchList = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/hero/list')
            if (response.data.success) {
                setList(response.data.heroes)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            if (!editingId && !image) {
                toast.error("Image is required for new slide");
                return;
            }

            setIsSubmitting(true)
            const formData = new FormData()
            formData.append("title", title)
            formData.append("subtitle", subtitle)
            formData.append("link", link)
            formData.append("order", order)
            if (image) {
                formData.append("image", image)
            }
            if (editingId) {
                formData.append("id", editingId)
            }

            const url = editingId ? backendUrl + '/api/hero/update' : backendUrl + '/api/hero/add';
            const response = await axios.post(url, formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                clearForm()
                fetchList()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const clearForm = () => {
        setTitle('')
        setSubtitle('')
        setLink('/collection')
        setOrder(0)
        setImage(false)
        setEditingId(null)
    }

    const handleEdit = (item) => {
        setEditingId(item._id)
        setTitle(item.title)
        setSubtitle(item.subtitle || '')
        setLink(item.link || '/collection')
        setOrder(item.order)
        setImage(false) // Reset image selection, so we don't upload unless requested
        window.scrollTo(0, 0)
    }

    const removeSlide = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/hero/remove', { id }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                fetchList()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchList()
    }, [])

    return (
        <div className='flex flex-col gap-8'>
            <h2 className='text-2xl font-bold'>Carousel Builder</h2>

            {/* Add Slide Form */}
            <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3 bg-white p-6 rounded shadow-sm border'>
                <p className='font-medium'>{editingId ? 'Edit Hero Slide' : 'Add New Hero Slide'}</p>

                <div className='flex flex-wrap gap-4 w-full'>
                    <div className='flex flex-col gap-2'>
                        <p className='text-sm text-gray-500'>Slide Image {editingId ? '(Leave empty to keep current)' : '(Portrait Recommended)'}</p>
                        <label htmlFor="image">
                            <img className='w-32 h-48 object-cover cursor-pointer border' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required={!editingId && !image} />
                        </label>
                    </div>

                    <div className='flex-1 flex flex-col gap-3 min-w-[280px]'>
                        <div className='w-full'>
                            <p className='mb-1 text-sm'>Slide Title</p>
                            <input onChange={(e) => setTitle(e.target.value)} value={title} className='w-full px-3 py-2 border' type="text" placeholder='e.g. Premium Essentials' />
                        </div>
                        <div className='w-full'>
                            <p className='mb-1 text-sm'>Slide Subtitle (Optional)</p>
                            <input onChange={(e) => setSubtitle(e.target.value)} value={subtitle} className='w-full px-3 py-2 border' type="text" placeholder='e.g. Summer Collection 2024' />
                        </div>
                        <div className='flex gap-4'>
                            <div className='flex-1'>
                                <p className='mb-1 text-sm'>Target Link</p>
                                <input onChange={(e) => setLink(e.target.value)} value={link} className='w-full px-3 py-2 border' type="text" placeholder='/collection' required />
                            </div>
                            <div className='w-24'>
                                <p className='mb-1 text-sm'>Order</p>
                                <input onChange={(e) => setOrder(e.target.value)} value={order} className='w-full px-3 py-2 border' type="number" placeholder='0' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex gap-4 mt-2'>
                    <button type="submit" disabled={isSubmitting} className='bg-black text-white px-10 py-3 hover:bg-gray-800 disabled:bg-gray-400'>
                        {isSubmitting ? 'SAVING...' : editingId ? 'UPDATE SLIDE' : 'ADD SLIDE'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={clearForm} className='bg-gray-300 text-black px-10 py-3 hover:bg-gray-400'>
                            CANCEL
                        </button>
                    )}
                </div>
            </form>

            {/* List Slides */}
            <div className='flex flex-col gap-4'>
                <p className='font-medium'>Current Slides ({list.length})</p>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {list.map((item, index) => (
                        <div key={item._id} className='relative group border rounded overflow-hidden bg-white shadow-sm'>
                            <img className='w-full h-64 object-cover' src={item.image} alt="" />
                            <div className='p-4 bg-white'>
                                <p className='font-bold text-lg truncate'>{item.title}</p>
                                <p className='text-sm text-gray-500 mb-2 truncate'>{item.subtitle || 'No subtitle'}</p>
                                <div className='flex justify-between items-center mt-2'>
                                    <span className='px-2 py-1 bg-gray-100 text-xs rounded border'>Order: {item.order}</span>
                                    <div className='flex gap-3'>
                                        <button onClick={() => handleEdit(item)} className='text-blue-500 hover:text-blue-700 text-sm font-medium'>Edit</button>
                                        <button onClick={() => removeSlide(item._id)} className='text-red-500 hover:text-red-700 text-sm font-medium'>Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {list.length === 0 && (
                        <div className='col-span-full py-10 text-center bg-gray-100 rounded border border-dashed border-gray-400'>
                            <p className='text-gray-500'>No slides found. Add your first slide above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Carousel
