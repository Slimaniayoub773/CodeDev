import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";
import Sidebar from "./Sidebar";
import { Pencil, Trash, PlusCircle, Search, Filter } from "lucide-react";

// Configure axios
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Modal.setAppElement("#root");

export default function Inscriptions() {
    const [inscriptions, setInscriptions] = useState([]);
    const [filteredInscriptions, setFilteredInscriptions] = useState([]);
    const [editingInscription, setEditingInscription] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [inscriptionsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true); 
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    // Fetch all inscriptions, users, and courses from the backend
    const fetchData = async () => {
        try {
            const [inscriptionsResponse, usersResponse, coursesResponse] = await Promise.all([
                axios.get("/api/user-courses", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }),
                axios.get("/api/utilisateurs", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }),
                axios.get("/api/courses", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                })
            ]);
            setInscriptions(inscriptionsResponse.data);
            setFilteredInscriptions(inscriptionsResponse.data);
            setUsers(usersResponse.data);
            setCourses(coursesResponse.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Apply filters whenever searchTerm or statusFilter changes
    useEffect(() => {
        let result = inscriptions;
        
        if (searchTerm) {
            result = result.filter(inscription => 
                inscription.utilisateur?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== "all") {
            result = result.filter(inscription => inscription.status === statusFilter);
        }
        
        setFilteredInscriptions(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, inscriptions]);

    const getCsrfToken = async () => {
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        } catch (error) {
            console.error("Error getting CSRF token:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            await getCsrfToken();

            if (editingInscription) {
                await axios.put(`/api/user-courses/${editingInscription.id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Enrollment updated successfully!");
            } else {
                await axios.post("/api/user-courses", data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Enrollment added successfully!");
            }

            fetchData();
            setModalIsOpen(false);
            setEditingInscription(null);
        } catch (error) {
            console.error("Error details:", error.response?.data);
            toast.error("Error saving enrollment");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/user-courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            toast.success("Enrollment deleted successfully!");
            fetchData();
        } catch (error) {
            toast.error("Error deleting enrollment");
        }
    };

    // Pagination Logic
    const indexOfLastInscription = currentPage * inscriptionsPerPage;
    const indexOfFirstInscription = indexOfLastInscription - inscriptionsPerPage;
    const currentInscriptions = filteredInscriptions.slice(indexOfFirstInscription, indexOfLastInscription);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
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
                            Loading enrollments...
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Enrollment Management</h1>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by user name..."
                            className="pl-10 pr-4 py-3 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="text-gray-400" size={18} />
                        </div>
                        <select
                            className="pl-10 pr-4 py-3 w-full border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={() => setModalIsOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center gap-2 whitespace-nowrap"
                    >
                        <PlusCircle size={18} />
                        Add Enrollment
                    </button>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                    {filteredInscriptions.length} enrollment(s) found
                </div>

                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left border-b border-gray-300">User</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Course</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Enrollment Date</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Status</th>
                                <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentInscriptions.length > 0 ? (
                                currentInscriptions.map((inscription) => (
                                    <tr key={inscription.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            {inscription.utilisateur && inscription.utilisateur.name ? inscription.utilisateur.name : "Unknown user"}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            {inscription.course ? inscription.course.title : "Unknown course"}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-300">{inscription.inscription_date}</td>
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            <span className={`px-2 py-1 rounded-full text-xs `}>
                                                {inscription.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            <button 
                                                onClick={() => { setEditingInscription(inscription); setModalIsOpen(true); }} 
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600 transition duration-300"
                                            >
                                                <Pencil className="inline mr-2" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(inscription.id)} 
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                                            >
                                                <Trash className="inline mr-2" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        No enrollments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredInscriptions.length > 0 && (
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
                                {Array.from({ length: Math.ceil(filteredInscriptions.length / inscriptionsPerPage) }, (_, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => paginate(i + 1)}
                                            className={`px-4 py-2 leading-tight text-white-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === i + 1 ? "bg-blue-500 text-white font-semibold" : ""}`}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredInscriptions.length / inscriptionsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredInscriptions.length / inscriptionsPerPage)}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(Math.ceil(filteredInscriptions.length / inscriptionsPerPage))}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredInscriptions.length / inscriptionsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredInscriptions.length / inscriptionsPerPage)}
                                    >
                                        Last
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={() => { setModalIsOpen(false); setEditingInscription(null); reset(); }} 
                className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">{editingInscription ? "Edit Enrollment" : "Add Enrollment"}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">User</label>
                        <select 
                            {...register("utilisateur_id", { required: "User is required" })} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={editingInscription?.utilisateur_id || ""}
                        >
                            <option value="">Select a user</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        {errors.utilisateur_id && <p className="text-red-500 text-sm">{errors.utilisateur_id.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Course</label>
                        <select 
                            {...register("course_id", { required: "Course is required" })} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={editingInscription?.course_id || ""}
                        >
                            <option value="">Select a course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Enrollment Date</label>
                        <input 
                            type="date" 
                            {...register("inscription_date", { required: "Enrollment date is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={editingInscription?.inscription_date || ""}
                        />
                        {errors.inscription_date && <p className="text-red-500 text-sm">{errors.inscription_date.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select
                            {...register("status", { required: "Status is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={editingInscription?.status || "pending"}
                        >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => { setModalIsOpen(false); setEditingInscription(null); reset(); }}
                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            {editingInscription ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </Modal>
            <ToastContainer 
                position="top-right" 
                autoClose={5000} 
                hideProgressBar={false} 
                newestOnTop={false} 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
            />
        </div>
    );
}