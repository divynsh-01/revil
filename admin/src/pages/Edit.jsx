import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { useNotification } from '../context/NotificationContext'
import { useParams } from 'react-router-dom'
import ProductForm from '../components/ProductForm'

const Edit = ({ token }) => {

    const { productId } = useParams()
    const { show } = useNotification();
    const [productData, setProductData] = useState(null)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.post(backendUrl + '/api/product/single', { productId })
                if (response.data.success) {
                    setProductData(response.data.product)
                } else {
                    show(response.data.message, 'error')
                }
            } catch (error) {
                console.log(error)
                show(error.message, 'error')
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
