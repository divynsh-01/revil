import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import ProductForm from '../components/ProductForm'

const Edit = ({ token }) => {

    const { productId } = useParams()
    const [productData, setProductData] = useState(null)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.post(backendUrl + '/api/product/single', { productId })
                if (response.data.success) {
                    setProductData(response.data.product)
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

        fetchProduct()
    }, [productId])

    return (
        <div className='w-full'>
            {productData ? (
                <ProductForm token={token} initialData={productData} isEdit={true} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default Edit
