import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useNotification } from '../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Login = () => {

    const [currentState, setCurrentState] = useState('Enter Phone');
    const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
    const { show } = useNotification();
    const [searchParams] = useSearchParams();

    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [tempToken, setTempToken] = useState('')

    const requestOtp = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/user/send-otp', { phone })
            if (response.data.success) {
                if (response.data.testOtp) {
                    show(`Test OTP: ${response.data.testOtp}`, 'success');
                } else {
                    show('OTP sent successfully!', 'success');
                }
                setCurrentState('Enter OTP');
            } else {
                show(response.data.message, 'error')
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error')
        }
    }

    const verifyOtp = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/user/verify-otp', { phone, otp })
            if (response.data.success) {
                const userData = response.data.user;
                if (!userData.name || userData.name === 'User' || !userData.email) {
                    setTempToken(response.data.token);
                    if (userData.name !== 'User') setName(userData.name);
                    if (userData.email) setEmail(userData.email);
                    setCurrentState('Complete Profile');
                } else {
                    setToken(response.data.token)
                    localStorage.setItem('token', response.data.token)
                    show('Logged in successfully!', 'success');
                }
            } else {
                show(response.data.message, 'error')
            }
        } catch (error) {
            console.log(error)
            show(error.message, 'error')
        }
    }

    const handleProfileCompletion = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                backendUrl + '/api/user/update-profile',
                { name, email },
                { headers: { token: tempToken } }
            );
            if (response.data.success) {
                setToken(tempToken);
                localStorage.setItem('token', tempToken);
                show('Logged in successfully!', 'success');
            } else {
                show(response.data.message, 'error')
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
        <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>Login / Register</p>
                <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
            </div>

            {currentState === 'Enter Phone' ? (
                <form onSubmit={requestOtp} className='w-full flex flex-col gap-4'>
                    <p className='text-sm text-center'>Enter your mobile number to receive an OTP.</p>
                    <input
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}
                        type="tel"
                        className='w-full px-3 py-2 border border-gray-800'
                        placeholder='Mobile Number'
                        required
                    />
                    <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4 w-full'>Send OTP</button>
                </form>
            ) : currentState === 'Enter OTP' ? (
                <form onSubmit={verifyOtp} className='w-full flex flex-col gap-4'>
                    <p className='text-sm text-center'>Enter the 6-digit OTP sent to {phone}.</p>
                    <input
                        onChange={(e) => setOtp(e.target.value)}
                        value={otp}
                        type="text"
                        className='w-full px-3 py-2 border border-gray-800 tracking-widest text-center text-xl'
                        placeholder='_ _ _ _ _ _'
                        maxLength={6}
                        required
                    />
                    <div className='w-full flex justify-between text-sm mt-[-8px]'>
                        <p onClick={() => setCurrentState('Enter Phone')} className='cursor-pointer underline'>Edit Phone Number</p>
                        <p onClick={requestOtp} className='cursor-pointer underline'>Resend OTP</p>
                    </div>
                    <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4 w-full'>Verify & Login</button>
                </form>
            ) : (
                <form onSubmit={handleProfileCompletion} className='w-full flex flex-col gap-4'>
                    <p className='text-sm text-center font-semibold text-green-600'>OTP Verified!</p>
                    <p className='text-sm text-center text-neutral-500'>Please fill out your details to complete your account.</p>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        className='w-full px-3 py-2 border border-gray-800'
                        placeholder='Full Name'
                        required
                    />
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email"
                        className='w-full px-3 py-2 border border-gray-800'
                        placeholder='Email Address'
                        required
                    />
                    <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4 w-full'>Complete & Login</button>
                </form>
            )}
        </div>
    )
}

export default Login
