import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`/api/notifications/${id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setNotifications(notifications.map(notification => 
                notification.id === id ? {...notification, read_at: new Date().toISOString()} : notification
            ));
            setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-all-read', {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setNotifications(notifications.map(notification => 
                ({...notification, read_at: notification.read_at || new Date().toISOString()})
            ));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                    <div className="p-4 bg-white border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <div className="flex space-x-2">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <Link 
                                to="/admin/notifications" 
                                className="text-sm text-gray-600 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read_at ? 'bg-blue-50' : ''}`}
                                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 h-3 w-3 mt-1 rounded-full ${!notification.read_at ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div className="ml-2 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{notification.data.message}</p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(notification.created_at)}
                                                </span>
                                                {notification.data.type === 'user_registered' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                        New User
                                                    </span>
                                                )}
                                                {notification.data.type === 'course_enrollment' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Enrollment
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;