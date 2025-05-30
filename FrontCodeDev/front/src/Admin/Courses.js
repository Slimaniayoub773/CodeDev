import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";
import Sidebar from "./Sidebar";
import { PlusCircle, Edit, Trash2, ZoomIn, Search, Filter, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
Modal.setAppElement("#root");

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [editingCourse, setEditingCourse] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [imageModalIsOpen, setImageModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage] = useState(7);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: ""
    });

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchCourses = async () => {
        try {
            const response = await axios.get("/api/courses");
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (error) {
            toast.error("Error loading courses");
        }
        finally {
            setLoading(false); // Stop loading whether success or error
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        // Apply filters whenever search term or date filters change
        let results = courses;
        
        // Apply search filter
        if (searchTerm) {
            results = results.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        
        // Apply date filters
        if (dateFilter.startDate) {
            results = results.filter(course => 
                new Date(course.start_date) >= new Date(dateFilter.startDate))
        }
        
        if (dateFilter.endDate) {
            results = results.filter(course => 
                new Date(course.end_date) <= new Date(dateFilter.endDate))
        }
        
        setFilteredCourses(results);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, dateFilter, courses]);

    const getCsrfToken = async () => {
        await axios.get("/sanctum/csrf-cookie");
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("start_date", data.start_date);
        formData.append("end_date", data.end_date);
        if (data.image[0]) formData.append("image", data.image[0]);

        await getCsrfToken();

        try {
            if (editingCourse) {
                await axios.post(`/api/courses/${editingCourse.id}?_method=PUT`, formData,{
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Course updated!");
            } else {
                await axios.post("/api/courses", formData,{
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Course added!");
            }

            fetchCourses();
            setModalIsOpen(false);
            reset();
            setEditingCourse(null);
        } catch (error) {
            toast.error("Error adding/updating");
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setValue("title", course.title);
        setValue("description", course.description);
        setValue("start_date", course.start_date);
        setValue("end_date", course.end_date);
        setModalIsOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/courses/${id}`,{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }});
            toast.success("Course deleted!");
            fetchCourses();
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setImageModalIsOpen(true);
    };

    const handleCloseImageModal = () => {
        setImageModalIsOpen(false);
        setSelectedImage(null);
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setSearchTerm("");
        setDateFilter({
            startDate: "",
            endDate: ""
        });
        setShowFilters(false);
    };

    // Pagination Logic
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

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
                            Loading Courses...
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Courses Management</h1>
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition duration-300 flex items-center gap-2"
                        >
                            <Filter size={18} />
                            Filters
                        </button>
                        
                        <button
                            onClick={resetFilters}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition duration-300 flex items-center gap-2"
                        >
                            <X size={18} />
                            Reset
                        </button>
                        
                        <button
                            onClick={() => setModalIsOpen(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                        >
                            <PlusCircle size={18} />
                            Add
                        </button>
                    </div>
                </div>
                
                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-3">Filter by date</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start date after</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateFilter.startDate}
                                    onChange={handleDateFilterChange}
                                    className="border-2 border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End date before</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateFilter.endDate}
                                    onChange={handleDateFilterChange}
                                    className="border-2 border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Results Count */}
                <div className="text-sm text-gray-500 mb-4">
                    {filteredCourses.length} courses found
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left border-b">Title</th>
                                <th className="py-3 px-6 text-left border-b">Start Date</th>
                                <th className="py-3 px-6 text-left border-b">End Date</th>
                                <th className="py-3 px-6 text-left border-b">Image</th>
                                <th className="py-3 px-6 text-left border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCourses.length > 0 ? (
                                currentCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b">{course.title}</td>
                                        <td className="py-3 px-6 border-b">{course.start_date}</td>
                                        <td className="py-3 px-6 border-b">{course.end_date}</td>
                                        <td className="py-3 px-6 border-b">
                                            {course.image ? (
                                                <div className="cursor-pointer">
                                                    <img
                                                        src={`http://localhost:8000${course.image}`}
                                                        alt="Course"
                                                        className="w-16 h-16 object-cover"
                                                        onClick={() => handleImageClick(course.image)}
                                                    />
                                                </div>
                                            ) : (
                                                <span>No image</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 border-b">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(course)}
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center gap-1"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-1"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-500">
                                        No courses found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredCourses.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <nav aria-label="Page navigation example">
                            <ul className="inline-flex -space-x-px text-sm">
                                <li>
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                    >
                                        First
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
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
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : ""}`}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : ""}`}
                                    >
                                        Last
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => {
                    setModalIsOpen(false);
                    setEditingCourse(null);
                    reset();
                }}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {editingCourse ? "Edit Course" : "Add Course"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            {...register("title", { required: "Title is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register("description", { required: "Description is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Image</label>
                        <input
                            type="file"
                            {...register("image")}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            {...register("start_date")}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            {...register("end_date")}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        {editingCourse ? "Update" : "Add"}
                    </button>
                </form>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                isOpen={imageModalIsOpen}
                onRequestClose={handleCloseImageModal}
                className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <div className="flex justify-center items-center">
                    {selectedImage && (
                        <img
                            src={`http://localhost:8000${selectedImage}`}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    )}
                </div>
                <button
                    onClick={handleCloseImageModal}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 mt-6 w-full"
                >
                    Close
                </button>
            </Modal>

            <ToastContainer />
        </div>
    );
}