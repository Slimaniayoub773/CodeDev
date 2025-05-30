import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Modal from "react-modal";
import Sidebar from "./Sidebar";
import { useForm } from "react-hook-form";
import { Pencil, Trash, PlusCircle, Search, Filter } from "lucide-react";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
Modal.setAppElement("#root");

export default function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [quizzesPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(true); 
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm();

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get("/api/quizzes", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setQuizzes(response.data);
            setFilteredQuizzes(response.data);
        } catch (error) {
            console.error("Full error details:", error.response?.data);
            toast.error(error.response?.data?.message || "Error loading quizzes");
        }finally {
            setLoading(false); // Stop loading whether success or error
        }
    };  

    const fetchCourses = async () => {
        try {
            const response = await axios.get("/api/courses");
            setCourses(response.data);
        } catch (error) {
            toast.error("Error loading courses");
        }
    };

    useEffect(() => {
        fetchQuizzes();
        fetchCourses();
    }, []);

    useEffect(() => {
        // Apply filters whenever searchTerm or selectedCourse changes
        let results = quizzes;
        
        if (searchTerm) {
            results = results.filter(quiz => 
                quiz.question.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        
        if (selectedCourse) {
            results = results.filter(quiz => 
                quiz.course_id.toString() === selectedCourse)
        }
        
        setFilteredQuizzes(results);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, selectedCourse, quizzes]);

    const getCsrfToken = async () => {
        await axios.get("/sanctum/csrf-cookie");
    };

    const onSubmit = async (data) => {
        await getCsrfToken();

        const formData = new FormData();
        formData.append("course_id", data.course_id);
        formData.append("question", data.question);
        formData.append("option_1", data.option_1);
        formData.append("option_2", data.option_2);
        formData.append("option_3", data.option_3);
        formData.append("option_4", data.option_4);
        formData.append("correct_answer", data.correct_answer);

        try {
            if (editingQuiz) {
                await axios.post(`/api/quizzes/${editingQuiz.id}?_method=PUT`, formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Quiz updated!");
            } else {
                await axios.post("/api/quizzes", formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Quiz added!");
            }
            fetchQuizzes();
            setModalIsOpen(false);
            reset();
            setEditingQuiz(null);
        } catch (error) {
            toast.error("Error saving quiz");
        }
    };

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);
        setValue("course_id", quiz.course_id);
        setValue("question", quiz.question);
        setValue("option_1", quiz.option_1);
        setValue("option_2", quiz.option_2);
        setValue("option_3", quiz.option_3);
        setValue("option_4", quiz.option_4);
        setValue("correct_answer", quiz.correct_answer);
        setModalIsOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/quizzes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            toast.success("Quiz deleted!");
            fetchQuizzes();
        } catch (error) {
            toast.error("Error deleting quiz");
        }
    };

    // Pagination Logic
    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
    const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

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
                            Loading Quizzes...
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Quiz Management</h1>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by question..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                            <option value="">All Courses</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        onClick={() => setModalIsOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center gap-2 whitespace-nowrap"
                    >
                        <PlusCircle size={18} />
                        Add Quiz
                    </button>
                </div>
                
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {currentQuizzes.length} of {filteredQuizzes.length} quizzes
                    {(searchTerm || selectedCourse) && (
                        <button 
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCourse("");
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left border-b">Question</th>
                                <th className="py-3 px-6 text-left border-b">Options</th>
                                <th className="py-3 px-6 text-left border-b">Correct Answer</th>
                                <th className="py-3 px-6 text-left border-b">Course</th>
                                <th className="py-3 px-6 text-left border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentQuizzes.length > 0 ? (
                                currentQuizzes.map((quiz) => {
                                    const course = courses.find(c => c.id === quiz.course_id);
                                    return (
                                        <tr key={quiz.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-6 border-b">{quiz.question}</td>
                                            <td className="py-3 px-6 border-b">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <span className="bg-gray-100 px-2 py-1 rounded">1. {quiz.option_1}</span>
                                                    <span className="bg-gray-100 px-2 py-1 rounded">2. {quiz.option_2}</span>
                                                    <span className="bg-gray-100 px-2 py-1 rounded">3. {quiz.option_3}</span>
                                                    <span className="bg-gray-100 px-2 py-1 rounded">4. {quiz.option_4}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 border-b">
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    {quiz.correct_answer}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 border-b">
                                                {course?.title || 'Unknown Course'}
                                            </td>
                                            <td className="py-3 px-6 border-b">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(quiz)}
                                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center gap-1"
                                                    >
                                                        <Pencil size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(quiz.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-1"
                                                    >
                                                        <Trash size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-500">
                                        No quizzes found {searchTerm || selectedCourse ? "matching your criteria" : ""}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredQuizzes.length > quizzesPerPage && (
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
                                {Array.from({ length: Math.ceil(filteredQuizzes.length / quizzesPerPage) }, (_, i) => (
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
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredQuizzes.length / quizzesPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredQuizzes.length / quizzesPerPage)}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => paginate(Math.ceil(filteredQuizzes.length / quizzesPerPage))}
                                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(filteredQuizzes.length / quizzesPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                                        disabled={currentPage === Math.ceil(filteredQuizzes.length / quizzesPerPage)}
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
                    setEditingQuiz(null);
                    reset();
                }}
                className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {editingQuiz ? "Edit Quiz" : "Add Quiz"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Course</label>
                        <select
                            {...register("course_id", { required: "Course is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Question</label>
                        <input
                            type="text"
                            placeholder="Question"
                            {...register("question", { required: "Question is required" })}
                            className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.question && <p className="text-red-500 text-sm">{errors.question.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Option 1</label>
                            <input
                                type="text"
                                placeholder="Option 1"
                                {...register("option_1", { required: "Option 1 is required" })}
                                className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.option_1 && <p className="text-red-500 text-sm">{errors.option_1.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Option 2</label>
                            <input
                                type="text"
                                placeholder="Option 2"
                                {...register("option_2", { required: "Option 2 is required" })}
                                className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.option_2 && <p className="text-red-500 text-sm">{errors.option_2.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Option 3</label>
                            <input
                                type="text"
                                placeholder="Option 3"
                                {...register("option_3", { required: "Option 3 is required" })}
                                className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.option_3 && <p className="text-red-500 text-sm">{errors.option_3.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Option 4</label>
                            <input
                                type="text"
                                placeholder="Option 4"
                                {...register("option_4", { required: "Option 4 is required" })}
                                className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.option_4 && <p className="text-red-500 text-sm">{errors.option_4.message}</p>}
                        </div>
                    </div>

                    <div>
            <label className="text-sm font-medium text-gray-700">Correct Answer</label>
            <input
                type="text"
                placeholder="Correct Answer"
                {...register("correct_answer", { required: "Correct answer is required" })}
                className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.correct_answer && <p className="text-red-500 text-sm">{errors.correct_answer.message}</p>}
        </div>

                    <div className="flex justify-end space-x-4 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setModalIsOpen(false);
                                reset();
                            }}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            {editingQuiz ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </Modal>
            <ToastContainer />
        </div>
    );
}