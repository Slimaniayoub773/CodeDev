import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Modal from "react-modal";
import Sidebar from "./Sidebar";
import { useForm } from "react-hook-form";
import { Pencil, UserPlus, ShieldAlert, Search, Filter } from "lucide-react";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
Modal.setAppElement("#root");

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [initialLoading, setInitialLoading] = useState(true); // For initial load only
    const [actionLoading, setActionLoading] = useState(false); // For actions
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        getValues,
    } = useForm();

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/utilisateurs", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
            
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        }
    };
    
    useEffect(() => {
        const loadData = async () => {
            try {
                setInitialLoading(true);
                await fetchUsers();
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        let result = users;
        
        if (searchTerm) {
            result = result.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }
        
        result = result.filter(user => !user.is_blocked);
        
        setFilteredUsers(result);
        setCurrentPage(1);
    }, [searchTerm, roleFilter, users]);

    const getCsrfToken = async () => {
        try {
            await axios.get("/sanctum/csrf-cookie");
        } catch (error) {
            console.error("Error getting CSRF token:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            setActionLoading(true);
            await getCsrfToken();
            if (editingUser) {
                await axios.put(`/api/utilisateurs/${editingUser.id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("User updated successfully!");
            } else {
                await axios.post("/api/utilisateurs", data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("User added successfully!");
            }
            await fetchUsers();
            setModalIsOpen(false);
            setEditingUser(null);
            reset();
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = error.response?.data?.message || "Operation failed";
            toast.error(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlock = async (id) => {
        try {
            setActionLoading(true);
            await axios.patch(`/api/utilisateurs/${id}/block`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            toast.success("User status updated successfully!");
            await fetchUsers();
        } catch (error) {
            console.error("Error updating user status:", error);
            const errorMessage = error.response?.data?.message || "Failed to update user status";
            toast.error(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    if (initialLoading) {
        return (
            <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="flex items-center mb-8">
                        <span className="text-5xl text-gray-400 font-mono mr-2">{'<'}</span>
                        <span className="text-4xl font-bold tracking-wider">
                            <span className="text-blue-600">Code</span>
                            <span className="text-blue-800">Dev</span>
                        </span>
                        <span className="text-5xl text-gray-400 font-mono ml-2">{'/>'}</span>
                    </div>

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

                    <p className="text-gray-600 font-mono text-sm mt-6">
                        <span className="inline-block border-r-2 border-blue-600 pr-1 animate-typing">
                            Loading users...
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">User Management</h1>
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={() => setModalIsOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center gap-2 whitespace-nowrap"
                        disabled={actionLoading}
                    >
                        <UserPlus size={18} />
                        {actionLoading ? "Processing..." : "Add User"}
                    </button>
                </div>
                
                {/* Users Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left border-b">Name</th>
                                <th className="py-3 px-6 text-left border-b">Email</th>
                                <th className="py-3 px-6 text-left border-b">Role</th>
                                <th className="py-3 px-6 text-left border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b">{user.name}</td>
                                        <td className="py-3 px-6 border-b">{user.email}</td>
                                        <td className="py-3 px-6 border-b">
                                            {user.role}
                                        </td>
                                        <td className="py-3 px-6 border-b">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setModalIsOpen(true);
                                                    }}
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center gap-1"
                                                    disabled={actionLoading}
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleBlock(user.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center gap-1"
                                                    disabled={actionLoading}
                                                >
                                                    <ShieldAlert size={16} />
                                                    {actionLoading ? "Processing..." : "Block"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-4 px-6 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <nav aria-label="Page navigation example">
                            <ul className="inline-flex -space-x-px text-sm">
                                <li>
                                    <button
                                        onClick={() => paginate(1)}
                                        className={`px-4 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === 1 || actionLoading}
                                    >
                                        First
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === 1 || actionLoading}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => paginate(i + 1)}
                                            className={`px-4 py-2 leading-tight text-white-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === i + 1 ? "bg-blue-500 text-white font-semibold" : ""}`}
                                            disabled={actionLoading}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredUsers.length / usersPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage) || actionLoading}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(Math.ceil(filteredUsers.length / usersPerPage))}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredUsers.length / usersPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage) || actionLoading}
                                    >
                                        Last
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* User Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => {
                    setModalIsOpen(false);
                    setEditingUser(null);
                    reset();
                }}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {editingUser ? "Edit User" : "Add User"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            placeholder="Name"
                            {...register("name", { required: "Name is required" })}
                            defaultValue={editingUser?.name || ""}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email",
                                },
                            })}
                            defaultValue={editingUser?.email || ""}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            {...register("password", {
                                required: !editingUser && "Password is required",
                                minLength: { value: 6, message: "Minimum 6 characters" },
                            })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            {...register("password_confirmation", {
                                validate: (value) =>
                                    value === getValues("password") || "Passwords don't match",
                            })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <select
                            {...register("role", { required: "Role is required" })}
                            defaultValue={editingUser?.role || ""}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select role --</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : editingUser ? "Update" : "Add"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setModalIsOpen(false);
                                setEditingUser(null);
                                reset();
                            }}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
                            disabled={actionLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}