import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaUnlockAlt, FaSearch, FaFilter } from "react-icons/fa";
import Sidebar from "./Sidebar";
import 'react-toastify/dist/ReactToastify.css';

export default function BlockedUsers() {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true); 

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/utilisateurs/blocked", {
                params: {
                    is_blocked: true
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setBlockedUsers(response.data);
            setFilteredUsers(response.data);
            
            // Extract unique roles from users
            const roles = [...new Set(response.data.map(user => user.role))];
            setAvailableRoles(roles);
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            toast.error(error.response?.data?.message || "Error fetching blocked users");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        try {
            const response = await axios.patch(
                `/api/utilisateurs/${id}/block`, 
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );
            
            toast.success(response.data.message || "User status updated successfully!");
            fetchBlockedUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating user status");
        }
    };

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    // Apply filters whenever search term or role filter changes
    useEffect(() => {
        let result = blockedUsers;
        
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user => 
                user.name.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
            );
        }
        
        // Apply role filter
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }
        
        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, roleFilter, blockedUsers]);

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    {/* Code brackets with logo */}
                    <div className="flex items-center mb-8">
                        <span className="text-5xl text-gray-400 font-mono mr-2">{'<'}</span>
                        <span className="text-4xl font-bold tracking-wider">
                            <span className="text-blue-600">Code</span>
                            <span className="text-blue-800">Dev</span>
                        </span>
                        <span className="text-5xl text-gray-400 font-mono ml-2">{'/>'}</span>
                    </div>

                    {/* Coding-themed loading animation */}
                    <div className="w-64 space-y-6">
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full animate-progress"></div>
                        </div>
                        
                        <div className="flex justify-center space-x-3">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="w-3 h-3 bg-blue-600 rounded-full opacity-70"
                                    style={{
                                        animation: `pulse 1.5s ease-in-out infinite`,
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Status text */}
                    <p className="text-gray-600 font-mono text-sm mt-6">
                        <span className="inline-block border-r-2 border-blue-600 pr-1 animate-typing">
                            Loading blocked users...
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="p-8 w-full max-w-7xl mx-auto">
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Blocked Users</h1>
                
                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center">
                            <FaFilter className="text-gray-500 mr-2" />
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All roles</option>
                                {availableRoles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Results Count */}
                <div className="mb-4 text-gray-600">
                    {filteredUsers.length} user(s) found
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Name</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Email</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Role</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b border-gray-300">{user.name}</td>
                                        <td className="py-3 px-6 border-b border-gray-300">{user.email}</td>
                                        <td className="py-3 px-6 border-b border-gray-300">{user.role}</td>
                                        <td className="py-3 px-6">
                                            <button 
                                                onClick={() => handleUnblock(user.id)} 
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center space-x-2"
                                            >
                                                <FaUnlockAlt /> 
                                                <span>Unblock</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-4 px-6 text-center text-gray-500">
                                        No blocked users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredUsers.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <nav aria-label="Page navigation example">
                            <ul className="inline-flex -space-x-px text-sm">
                                <li>
                                    <button
                                        onClick={() => paginate(1)}
                                        className={`px-4 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === 1}
                                    >
                                        First
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => {
                                    // Show only nearby pages for better UX with many pages
                                    if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                                        return (
                                            <li key={i}>
                                                <button
                                                    onClick={() => paginate(i + 1)}
                                                    className={`px-4 py-2 leading-tight text-white-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === i + 1 ? "bg-blue-500 text-white font-semibold" : ""}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        );
                                    }
                                    // Show ellipsis for skipped pages
                                    if (i === 1 || i === totalPages - 2) {
                                        return (
                                            <li key={i} className="px-4 py-2 leading-tight text-gray-500">
                                                ...
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === totalPages}
                                    >
                                        Last
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
}