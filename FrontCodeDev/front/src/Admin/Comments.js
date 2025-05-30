    import { useEffect, useState } from "react";
    import axios from "axios";
    import { toast, ToastContainer } from "react-toastify"; 
    import { FaTrashAlt } from "react-icons/fa"; 
    import Sidebar from "./Sidebar";
    import 'react-toastify/dist/ReactToastify.css'; 

    axios.defaults.baseURL = 'http://localhost:8000';
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    export default function Comments() {
        const [comments, setComments] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [commentsPerPage] = useState(10); 

        const fetchComments = async () => {
            try {
                const response = await axios.get("/api/comments");
                setComments(response.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
                toast.error("Erreur lors de la récupération des commentaires");
            }
        };

        useEffect(() => {
            fetchComments();
        }, []);

        const handleDelete = async (id) => {
            try {
                await axios.delete(`/api/comments/${id}`,{
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                toast.success("Commentaire supprimé !");
                fetchComments();
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        };
        const indexOfLastComment = currentPage * commentsPerPage;
        const indexOfFirstComment = indexOfLastComment - commentsPerPage;
        const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

        const paginate = (pageNumber) => setCurrentPage(pageNumber);

        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="p-8 w-full max-w-7xl mx-auto">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-6">Gestion des Commentaires</h1>
                    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                        <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                            <thead className="bg-blue-500 text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left border-b border-gray-300">Utilisateur</th>
                                    <th className="py-3 px-6 text-left border-b border-gray-300">Leçon</th>
                                    <th className="py-3 px-6 text-left border-b border-gray-300">Commentaire</th>
                                    <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentComments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            {comment.utilisateur?.name || "Utilisateur inconnu"}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-300">
                                            {comment.lesson?.title || "Leçon inconnue"}
                                        </td>
                                        <td className="py-3 px-6 border-b border-gray-300">{comment.text}</td>
                                        <td className="py-3 px-6">
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                                            >
                                                <FaTrashAlt className="mr-2" /> Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }, (_, i) => (
                    <li key={i}>
                        <button
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 leading-tight text-blue-400 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === i + 1 ? "bg-blue-600 text-white font-semibold" : ""}`}
                        >
                            {i + 1}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(comments.length / commentsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                        disabled={currentPage === Math.ceil(comments.length / commentsPerPage)}
                    >
                        Next
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => paginate(Math.ceil(comments.length / commentsPerPage))}
                        className={`px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-blue-500 hover:text-white ${currentPage === Math.ceil(comments.length / commentsPerPage) ? "text-gray-300 cursor-not-allowed" : ""}`}
                        disabled={currentPage === Math.ceil(comments.length / commentsPerPage)}
                    >
                        Last
                    </button>
                </li>
            </ul>
        </nav>
    </div>

                </div>
                <ToastContainer /> 
            </div>
        );
    }