import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useNotification } from '../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
  const { show } = useNotification();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('')
  const [password, setPasword] = useState('')
  const [email, setEmail] = useState('')

  const onSubmitHandler = async (event) => {
      event.preventDefault();
      try {
        if (currentState === 'Sign Up') {
          
          const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
          } else {
            show(response.data.message, 'error')
          }

        } else {

          const response = await axios.post(backendUrl + '/api/user/login', { email, password })
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
          } else {
            show(response.data.message, 'error')
          }

        }


      } catch (error) {
        console.log(error)
        show(error.message, 'error')
      }
  }

  useEffect(() => {
    if (token) {
      // Navigate to redirect target if provided, otherwise home
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect)
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
        {currentState === 'Login' ? '' : <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required />}
        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
        <input onChange={(e) => setPasword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required />
        <div className='w-full flex justify-end text-sm mt-[-8px]'>
            {
              currentState === 'Login' 
              ? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer hover:underline'>Create account</p>
              : <p onClick={() => setCurrentState('Login')} className='cursor-pointer hover:underline'>Login Here</p>
            }
        </div>
        <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
    </form>
  )
}

export default Login
