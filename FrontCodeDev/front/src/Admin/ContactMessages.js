import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaTrashAlt, FaEnvelope, FaReply, FaChevronLeft, FaChevronRight, FaStepBackward, FaStepForward, FaSearch, FaFilter } from "react-icons/fa";
import Sidebar from "./Sidebar";
import 'react-toastify/dist/ReactToastify.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default function ContactMessages() {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(10);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [readFilter, setReadFilter] = useState('all'); // 'all', 'read', 'unread'

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/contact-messages", {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            // Normalize read status to boolean
            const normalizedMessages = response.data.map(message => ({
                ...message,
                read: Boolean(message.read)
            }));
            
            setMessages(normalizedMessages);
            setFilteredMessages(normalizedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Error fetching messages");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // Apply search and filter
    useEffect(() => {
        let result = [...messages];
        
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(message => 
                message.name.toLowerCase().includes(term) || 
                message.email.toLowerCase().includes(term)
            );
        }
        
        // Apply read status filter
        if (readFilter !== 'all') {
            const wantRead = readFilter === 'read';
            result = result.filter(message => message.read === wantRead);
        }
        
        setFilteredMessages(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, readFilter, messages]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        
        try {
            await axios.delete(`/api/contact-messages/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            toast.success("Message deleted successfully!");
            fetchMessages();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.message || "Error deleting message");
        }
    };

    const handleReply = async () => {
        if (!selectedMessage || !replyContent.trim()) {
            toast.warning("Please enter a reply message");
            return;
        }

        setIsSending(true);
        try {
            const response = await axios.post(
                `/api/contact-messages/${selectedMessage.id}/reply`,
                { reply: replyContent },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.status >= 200 && response.status < 300) {
                toast.success("Reply sent successfully!");
                setSelectedMessage(null);
                setReplyContent('');
                fetchMessages();
            } else {
                toast.warning(response.data?.message || "Reply processed but with unexpected status");
            }
        } catch (error) {
            console.error("Reply error:", error);
            const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.message || 
                              "Error sending reply";
            toast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`/api/contact-messages/${id}/mark-as-read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            // Update both messages and filteredMessages
            setMessages(prev => prev.map(msg => 
                msg.id === id ? { ...msg, read: true } : msg
            ));
            setFilteredMessages(prev => prev.map(msg => 
                msg.id === id ? { ...msg, read: true } : msg
            ));
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    // Pagination logic
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
    const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };
    
    if (isLoading) {
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
                            Loading messages...
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="p-4 md:p-8 w-full max-w-7xl mx-auto overflow-auto">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Contact Messages</h1>
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <FaFilter className="text-gray-400 mr-2" />
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                                value={readFilter}
                                onChange={(e) => setReadFilter(e.target.value)}
                            >
                                <option value="all">All messages</option>
                                <option value="read">Read messages</option>
                                <option value="unread">Unread messages</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-lg rounded-lg mb-6 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-600 text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Message</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentMessages.length > 0 ? (
                                            currentMessages.map((message) => (
                                                <tr 
                                                    key={message.id} 
                                                    className={`hover:bg-gray-50 ${message.read ? '' : 'bg-blue-50 font-medium'}`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">{message.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                                                        <a href={`mailto:${message.email}`}>{message.email}</a>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate">{message.message}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${message.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {message.read ? 'Read' : 'Unread'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {new Date(message.created_at).toLocaleDateString('en-US', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMessage(message);
                                                                markAsRead(message.id);
                                                            }}
                                                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                        >
                                                            <FaEnvelope className="mr-1" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(message.id)}
                                                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                                        >
                                                            <FaTrashAlt className="mr-1" /> Del.
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    {filteredMessages.length === 0 && messages.length > 0 
                                                        ? "No messages match your search criteria"
                                                        : "No messages found"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {filteredMessages.length > messagesPerPage && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to <span className="font-medium">
                                        {Math.min(indexOfLastMessage, filteredMessages.length)}
                                    </span> of <span className="font-medium">{filteredMessages.length}</span> messages
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FaStepBackward />
                                    </button>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FaChevronRight />
                                    </button>
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FaStepForward />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Message Detail Modal */}
                {selectedMessage && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <div className="p-6 flex-1 overflow-auto">
                                <h2 className="text-xl font-semibold mb-4">Message Details</h2>
                                
                                <div className="mb-4 space-y-2">
                                    <p className="font-medium">
                                        <span className="text-gray-600">From:</span> {selectedMessage.name}
                                    </p>
                                    <p className="font-medium">
                                        <span className="text-gray-600">Email:</span> {selectedMessage.email}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        <span className="text-gray-600">Sent on:</span> {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="font-medium text-gray-700 mb-2">Original message:</h3>
                                    <p className="whitespace-pre-line text-gray-800">{selectedMessage.message}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Your reply:</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={6}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Type your reply here..."
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setSelectedMessage(null);
                                        setReplyContent('');
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReply}
                                    disabled={isSending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-70"
                                >
                                    {isSending ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaReply className="mr-2" /> Send Reply
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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