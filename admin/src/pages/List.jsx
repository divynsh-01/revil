import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubCategory, setFilterSubCategory] = useState("")

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list")
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/subcategory/list")
      if (response.data.success) {
        setSubCategories(response.data.subCategories)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchList = async () => {
    try {

      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {

      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
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
    fetchCategories()
    fetchSubCategories()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>

      {/* Search and Filter Section */}
      <div className='flex flex-col md:flex-row gap-4 mb-4'>
        <input
          type="text"
          placeholder="Search by name..."
          className='p-2 border border-gray-300 rounded-md w-full md:w-1/3'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className='p-2 border border-gray-300 rounded-md w-full md:w-1/4'
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select
          className='p-2 border border-gray-300 rounded-md w-full md:w-1/4'
          value={filterSubCategory}
          onChange={(e) => setFilterSubCategory(e.target.value)}
        >
          <option value="">All Sub-Categories</option>
          {subCategories.map((sub, index) => (
            <option key={index} value={sub.name}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div className='flex flex-col gap-2'>

        {/* ------- List Table ---------- */}

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}

        {
          list.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "" || item.category === filterCategory;
            const matchesSubCategory = filterSubCategory === "" || item.subCategory === filterSubCategory;
            return matchesSearch && matchesCategory && matchesSubCategory;
          }).map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.images?.[0]?.url || item.images?.[0] || item.image?.[0] || ''} alt="" />
              <p>{item.title || item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.discountPrice || item.price}</p>
              <div className='text-right md:text-center flex justify-end md:justify-center gap-2 col-start-3 md:col-auto'>
                <p onClick={() => window.location.href = `/edit/${item._id}`} className='cursor-pointer text-blue-500 hover:text-blue-700'>Edit</p>
                <p onClick={() => removeProduct(item._id)} className='cursor-pointer text-red-500 hover:text-red-700'>Delete</p>
              </div>
            </div>
          ))
        }

      </div>
    </>
  )
}

export default List