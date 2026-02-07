import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {

    const { backendUrl, token, navigate } = useContext(ShopContext);

    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Password form data
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Fetch user profile
    const loadUserProfile = async () => {
        try {
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });

            if (response.data.success) {
                setUserData(response.data.user);
                setFormData({
                    name: response.data.user.name,
                    email: response.data.user.email,
                    phone: response.data.user.phone || ''
                });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                backendUrl + '/api/user/update-profile',
                formData,
                { headers: { token } }
            );

            if (response.data.success) {
                setUserData(response.data.user);
                setIsEditing(false);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                backendUrl + '/api/user/change-password',
                {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setIsChangingPassword(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, [token]);

    if (!userData) {
        return <div className='border-t pt-16 min-h-screen flex items-center justify-center'>
            <p className='text-neutral-500'>Loading...</p>
        </div>;
    }

    return (
        <div className='border-t pt-16 pb-20 px-4 sm:px-0'>
            <div className='max-w-4xl mx-auto'>

                {/* Page Title */}
                <div className='mb-8'>
                    <Title text1={'MY'} text2={'PROFILE'} />
                </div>

                {/* Profile Header */}
                <div className='bg-neutral-50 p-6 sm:p-8 rounded-sm mb-8'>
                    <div className='flex items-center gap-4'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-semibold'>
                            {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className='text-xl sm:text-2xl font-semibold text-black'>{userData.name}</h2>
                            <p className='text-sm text-neutral-600 mt-1'>{userData.email}</p>
                            <p className='text-xs text-neutral-500 mt-1'>
                                Member since {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personal Information Section */}
                <div className='bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 mb-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-lg font-semibold text-black'>Personal Information</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className='text-sm text-black hover:underline'
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm text-neutral-500 block mb-1'>Full Name</label>
                                <p className='text-base text-black'>{userData.name}</p>
                            </div>
                            <div>
                                <label className='text-sm text-neutral-500 block mb-1'>Email Address</label>
                                <p className='text-base text-black'>{userData.email}</p>
                            </div>
                            <div>
                                <label className='text-sm text-neutral-500 block mb-1'>Phone Number</label>
                                <p className='text-base text-black'>{userData.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className='space-y-4'>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>Full Name</label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className='input w-full'
                                    required
                                />
                            </div>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>Email Address</label>
                                <input
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className='input w-full'
                                    required
                                />
                            </div>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>Phone Number</label>
                                <input
                                    type='tel'
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className='input w-full'
                                    placeholder='Optional'
                                />
                            </div>
                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='btn btn-primary px-8'
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: userData.name,
                                            email: userData.email,
                                            phone: userData.phone || ''
                                        });
                                    }}
                                    className='btn btn-outline px-8'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Password Section */}
                <div className='bg-white border border-neutral-200 rounded-sm p-6 sm:p-8'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-lg font-semibold text-black'>Password</h3>
                        {!isChangingPassword && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className='text-sm text-black hover:underline'
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {!isChangingPassword ? (
                        <p className='text-sm text-neutral-600'>••••••••</p>
                    ) : (
                        <form onSubmit={handleChangePassword} className='space-y-4'>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>Current Password</label>
                                <input
                                    type='password'
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className='input w-full'
                                    required
                                />
                            </div>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>New Password</label>
                                <input
                                    type='password'
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className='input w-full'
                                    required
                                    minLength={8}
                                />
                                <p className='text-xs text-neutral-500 mt-1'>Must be at least 8 characters</p>
                            </div>
                            <div>
                                <label className='text-sm text-neutral-700 block mb-2'>Confirm New Password</label>
                                <input
                                    type='password'
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className='input w-full'
                                    required
                                />
                            </div>
                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='btn btn-primary px-8'
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className='btn btn-outline px-8'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Profile
