import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Users = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState('');

    // Fetch current user's role
    const fetchUserRole = async () => {
        try {
            const response = await axios.post(
                backendUrl + '/api/user/role',
                {},
                { headers: { token } }
            );
            if (response.data.success) {
                setCurrentUserRole(response.data.role);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/list', {
                headers: { token },
            });

            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Promote user to admin
    const promoteUser = async (userId) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/user/promote',
                { userId },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Demote admin to user
    const demoteUser = async (userId) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/user/demote',
                { userId },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchUserRole();
        fetchUsers();
    }, [token]);

    // Only show to owner
    if (currentUserRole !== 'owner') {
        return (
            <div className='p-8 text-center'>
                <h2 className='text-2xl font-semibold text-gray-700'>Access Denied</h2>
                <p className='text-gray-500 mt-2'>Only the owner can manage users.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className='text-2xl font-semibold mb-4'>User Management</h3>
            <p className='text-gray-600 mb-6'>Manage user roles and permissions</p>

            <div className='overflow-x-auto'>
                <table className='w-full bg-white border border-gray-200 rounded-lg'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Name
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Email
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Phone
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Role
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Joined
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className='border-t border-gray-200 hover:bg-gray-50'>
                                <td className='px-6 py-4 text-sm text-gray-800'>{user.name}</td>
                                <td className='px-6 py-4 text-sm text-gray-600'>{user.email}</td>
                                <td className='px-6 py-4 text-sm text-gray-600'>
                                    {user.phone || '-'}
                                </td>
                                <td className='px-6 py-4 text-sm'>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'owner'
                                                ? 'bg-purple-100 text-purple-700'
                                                : user.role === 'admin'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className='px-6 py-4 text-sm text-gray-600'>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className='px-6 py-4 text-sm'>
                                    {user.role === 'owner' ? (
                                        <span className='text-gray-400 text-xs'>Protected</span>
                                    ) : user.role === 'user' ? (
                                        <button
                                            onClick={() => promoteUser(user._id)}
                                            className='bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-xs'
                                        >
                                            Promote to Admin
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => demoteUser(user._id)}
                                            className='bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 text-xs'
                                        >
                                            Demote to User
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                        No users found
                    </div>
                )}
            </div>

            <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h4 className='font-semibold text-blue-900 mb-2'>Role Permissions:</h4>
                <ul className='text-sm text-blue-800 space-y-1'>
                    <li>
                        <strong>Owner:</strong> Full access + can promote/demote admins
                    </li>
                    <li>
                        <strong>Admin:</strong> Can manage products, orders, coupons, categories
                    </li>
                    <li>
                        <strong>User:</strong> Regular customer with no admin access
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Users;
