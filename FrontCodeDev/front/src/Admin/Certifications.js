import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";
import { Edit, Trash, Plus, Eye, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Modal.setAppElement("#root");

// Modal styles
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  }
};

export default function Certifications() {
    const navigate = useNavigate();
    const [certifications, setCertifications] = useState([]);
    const [filteredCertifications, setFilteredCertifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingCertification, setEditingCertification] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [certificationsPerPage] = useState(9);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true); 
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: ""
    });
    const [showDateFilter, setShowDateFilter] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchCertifications = async () => {
        try {
            const [certResponse, usersResponse, coursesResponse] = await Promise.all([
                axios.get("/api/certifications", {
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
                        'Authorization': `Bearer ${localStorage.getItem('authToken  ')}`
                    }
                })
            ]);
            setCertifications(certResponse.data);
            setFilteredCertifications(certResponse.data);
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
        fetchCertifications();
    }, []);

    useEffect(() => {
        let results = certifications;
        
        if (searchTerm) {
            results = results.filter(cert => 
                cert.utilisateur?.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        
        if (dateFilter.startDate || dateFilter.endDate) {
            const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
            const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
            
            results = results.filter(cert => {
                const certDate = new Date(cert.issue_date);
                return (
                    (!startDate || certDate >= startDate) &&
                    (!endDate || certDate <= endDate)
                );
            });
        }
        
        setFilteredCertifications(results);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, certifications]);

    const getCsrfToken = async () => {
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        } catch (error) {
            console.error("Error getting CSRF token:", error);
        }
    };

    const onSubmit = async (data) => {
    try {
        // First get CSRF cookie - use the full URL since it's a different endpoint
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        
        const config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const payload = {
            utilisateur_id: data.utilisateur_id,
            course_id: data.course_id,
            issue_date: data.issue_date,
            score: data.score || 0 // Provide default if empty
        };

        if (editingCertification) {
            await axios.put(`/api/certifications/${editingCertification.id}`, payload, config);
            toast.success("Certification updated successfully!");
        } else {
            await axios.post("/api/certifications", payload, config);
            toast.success("Certification added successfully!");
        }

        fetchCertifications();
        setModalIsOpen(false);
        setEditingCertification(null);
        reset();
    } catch (error) {
        console.error("Error details:", error.response?.data);
        // Display validation errors if they exist
        if (error.response?.data?.errors) {
            Object.values(error.response.data.errors).forEach(err => {
                toast.error(err[0]);
            });
        } else {
            toast.error(error.response?.data?.message || "Operation error");
        }
    }
};
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/certifications/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            toast.success("Certification deleted successfully!");
            fetchCertifications();
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
        setEditingCertification(null);
        reset();
    };

    // Pagination Logic
    const indexOfLastCertification = currentPage * certificationsPerPage;
    const indexOfFirstCertification = indexOfLastCertification - certificationsPerPage;
    const currentCertifications = filteredCertifications.slice(indexOfFirstCertification, indexOfLastCertification);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const resetFilters = () => {
        setSearchTerm("");
        setDateFilter({
            startDate: "",
            endDate: ""
        });
        setFilteredCertifications(certifications);
    };

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
                            Loading Certifications...
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Certifications Management</h1>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="relative w-full md:w-1/2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by user name..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Filter className="h-5 w-5" />
                            Date filter
                        </button>
                        
                        <button
                            onClick={resetFilters}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                        >
                            Reset
                        </button>
                        
                        <button 
                            onClick={() => { setModalIsOpen(true); setEditingCertification(null); reset(); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" /> Add
                        </button>
                    </div>
                </div>
                
                {showDateFilter && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-sm text-gray-500 mb-4">
                    {filteredCertifications.length} results found
                </div>
                
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Issue date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentCertifications.length > 0 ? (
                                currentCertifications.map((certification) => (
                                    <tr key={certification.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {certification.utilisateur?.name || "Unknown user"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {certification.course?.title || "Unknown course"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(certification.issue_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/certificates/${certification.id}`)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                            >
                                                <Eye className="mr-2" /> View
                                            </button>
                                            <button
                                                onClick={() => { setEditingCertification(certification); setModalIsOpen(true); }}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                            >
                                                <Edit className="mr-2" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(certification.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                            >
                                                <Trash className="mr-2" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No certifications found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredCertifications.length > 0 && (
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
                                {Array.from({ length: Math.ceil(filteredCertifications.length / certificationsPerPage) }, (_, i) => (
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
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredCertifications.length / certificationsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredCertifications.length / certificationsPerPage)}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(Math.ceil(filteredCertifications.length / certificationsPerPage))}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredCertifications.length / certificationsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredCertifications.length / certificationsPerPage)}
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
                onRequestClose={handleModalClose}
                style={customStyles}
                contentLabel={editingCertification ? "Edit certification" : "Add certification"}
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {editingCertification ? "Edit certification" : "New certification"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
                        <select
    {...register("utilisateur_id", { required: "This field is required" })}
    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
    defaultValue={editingCertification?.utilisateur_id || ""}
>
    <option value="">Select a user</option>
    {users.map(user => (
        <option key={user.id} value={user.id.toString()}>{user.name}</option> // Ensure value is string
    ))}
</select>
                        {errors.utilisateur_id && <p className="mt-1 text-sm text-red-600">{errors.utilisateur_id.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                        <select
                            {...register("course_id", { required: "This field is required" })}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={editingCertification?.course_id || ""}
                        >
                            <option value="">Select a course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                        {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue date *</label>
                        <input
    type="date"
    {...register("issue_date", { required: "This field is required" })}
    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
    defaultValue={editingCertification?.issue_date ? new Date(editingCertification.issue_date).toISOString().split('T')[0] : ""}
/>
                        {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>}
                    </div>

<div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Score *</label>
    <input
        type="number"
        {...register("score", { required: "This field is required" })}
        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        defaultValue={editingCertification?.score || ""}
    />
    {errors.score && <p className="mt-1 text-sm text-red-600">{errors.score.message}</p>}
</div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {editingCertification ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
}