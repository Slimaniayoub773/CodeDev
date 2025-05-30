import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import Modal from "react-modal";
import Sidebar from "./Sidebar";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Modal.setAppElement("#root");

export default function LessonManagement() {
    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingLesson, setEditingLesson] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lessonsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [completionFilter, setCompletionFilter] = useState("all");
    const [codeModalIsOpen, setCodeModalIsOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState("");
    const [loading, setLoading] = useState(true); 
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    const fetchLessonsAndCourses = async () => {
        try {
            const [lessonsResponse, coursesResponse] = await Promise.all([
                axios.get("/api/lessons"),
                axios.get("/api/courses")
            ]);
            setLessons(lessonsResponse.data);
            setCourses(coursesResponse.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching lessons or courses");
        } finally {
            setLoading(false); // Stop loading whether success or error
        }
    };

    useEffect(() => {
        fetchLessonsAndCourses();
    }, []);

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

            if (editingLesson) {
                await axios.put(`/api/lessons/${editingLesson.id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Lesson updated!");
            } else {
                await axios.post("/api/lessons", data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Lesson added!");
            }

            fetchLessonsAndCourses();
            setModalIsOpen(false);
            setEditingLesson(null);
            reset();
        } catch (error) {
            console.error("Error details:", error.response?.data);
            toast.error("Error adding or updating lesson");
        }
    };

    const handleEditClick = (lesson) => {
        setEditingLesson(lesson);
        setValue("title", lesson.title);
        setValue("explain", lesson.explain);
        setValue("course_id", lesson.course_id);
        setValue("code_chunk", lesson.code_chunk);
        setValue("is_completed", lesson.is_completed);
        setModalIsOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/lessons/${id}`,{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }});
            toast.success("Lesson deleted!");
            fetchLessonsAndCourses();
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const showCode = (code) => {
        setSelectedCode(code || "No code available");
        setCodeModalIsOpen(true);
    };

    // Filter and search logic
    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
            completionFilter === "all" || 
            (completionFilter === "completed" && lesson.is_completed) ||
            (completionFilter === "incomplete" && !lesson.is_completed);
        
        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const indexOfLastLesson = currentPage * lessonsPerPage;
    const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
    const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);

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
                            Loading Lessons...
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-full mx-auto">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-6">Lesson Management</h1>
                    
                    {/* Search and Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-2 border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="relative w-full md:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaFilter className="text-gray-400" />
                            </div>
                            <select
                                value={completionFilter}
                                onChange={(e) => {
                                    setCompletionFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border-2 border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="all">All statuses</option>
                                <option value="completed">Completed</option>
                                <option value="incomplete">In progress</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setEditingLesson(null);
                                reset();
                                setModalIsOpen(true);
                            }} 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                        >
                            <FaPlus className="inline-block mr-2" /> Add
                        </button>
                    </div>
        
                    <div className="bg-white shadow-lg rounded-lg w-full overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-500 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-medium">Title</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium w-2/5">Explanation</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium">Code</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium">Course</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentLessons.length > 0 ? (
                                    currentLessons.map((lesson) => (
                                        <tr key={lesson.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">{lesson.title}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{lesson.explain}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {lesson.code_chunk ? (
                                                    <button 
                                                        onClick={() => showCode(lesson.code_chunk)}
                                                        className="text-blue-600 hover:text-blue-800 font-mono text-xs underline"
                                                    >
                                                        View code
                                                    </button>
                                                ) : (
                                                    "None"
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {lesson.is_completed ? (
                                                    <p>Completed</p>
                                                ) : (
                                                    <p>In progress</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{lesson.course?.title || "Not assigned"}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleEditClick(lesson)} 
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-300 text-sm"
                                                    >
                                                        <FaEdit className="inline-block mr-1" /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(lesson.id)} 
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300 text-sm"
                                                    >
                                                        <FaTrash className="inline-block mr-1" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-4 text-center text-gray-500">
                                            No lessons found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
        
                    {/* Pagination Controls */}
                    {filteredLessons.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <nav aria-label="Page navigation example">
                                <ul className="inline-flex -space-x-px text-sm">
                                    <li>
                                        <button
                                            onClick={() => paginate(1)}
                                            className={`px-3 py-1 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                            disabled={currentPage === 1}
                                        >
                                            First
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            className={`px-3 py-1 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""}`}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({ length: Math.ceil(filteredLessons.length / lessonsPerPage) }, (_, i) => (
                                        <li key={i}>
                                            <button
                                                onClick={() => paginate(i + 1)}
                                                className={`px-3 py-1 leading-tight text-white-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === i + 1 ? "bg-blue-500 text-white font-semibold" : ""}`}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li>
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            className={`px-3 py-1 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredLessons.length / lessonsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                            disabled={currentPage === Math.ceil(filteredLessons.length / lessonsPerPage)}
                                        >
                                            Next
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => paginate(Math.ceil(filteredLessons.length / lessonsPerPage))}
                                            className={`px-3 py-1 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredLessons.length / lessonsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                            disabled={currentPage === Math.ceil(filteredLessons.length / lessonsPerPage)}
                                        >
                                            Last
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
    
            {/* Modal for Adding or Editing Lesson */}
            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={() => { 
                    setModalIsOpen(false); 
                    setEditingLesson(null); 
                    reset(); 
                }} 
                className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {editingLesson ? "Edit Lesson" : "Add Lesson"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Lesson Title</label>
                        <input 
                            type="text" 
                            placeholder="Title" 
                            {...register("title", { required: "Title is required" })} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Explanation</label>
                        <textarea 
                            placeholder="Detailed explanation" 
                            {...register("explain", { required: "Explanation is required" })} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                        ></textarea>
                        {errors.explain && <p className="text-red-500 text-sm">{errors.explain.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Code (optional)</label>
                        <textarea 
                            placeholder="Code snippet" 
                            {...register("code_chunk")} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Select Course</label>
                        <select 
                            {...register("course_id", { required: "Course is required" })} 
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                        {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id.message}</p>}
                    </div>
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="is_completed"
                            {...register("is_completed")} 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_completed" className="ml-2 block text-sm text-gray-700">
                            Lesson completed
                        </label>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={() => {
                                setModalIsOpen(false);
                                setEditingLesson(null);
                                reset();
                            }}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            {editingLesson ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </Modal>
            
            {/* Code View Modal */}
            <Modal 
                isOpen={codeModalIsOpen} 
                onRequestClose={() => setCodeModalIsOpen(false)} 
                className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lesson Code</h2>
                <div className="max-h-[70vh] overflow-auto">
                    <SyntaxHighlighter 
                        language="javascript" 
                        style={atomDark}
                        showLineNumbers
                        wrapLines
                        customStyle={{ 
                            margin: 0,
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}
                    >
                        {selectedCode}
                    </SyntaxHighlighter>
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => setCodeModalIsOpen(false)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        Close
                    </button>
                </div>
            </Modal>
    
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
}