import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon, 
  ClockIcon, 
  UserPlusIcon, 
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { AlertTriangleIcon } from 'lucide-react'; // إذا كنت تستخدم <AlertTriangleIcon />


const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async (pageNum = 1, refresh = false) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`/api/notifications`, {
                params: {
                    page: pageNum,
                    filter: activeTab
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (refresh) {
                setNotifications(response.data.notifications);
            } else {
                setNotifications(prev => [...prev, ...response.data.notifications]);
            }
            
            setUnreadCount(response.data.unread_count);
            setHasMore(response.data.has_more);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchNotifications(1, true);
    }, [activeTab]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage);
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

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`/api/notifications/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            setNotifications(notifications.filter(notification => notification.id !== id));
            // Decrease unread count if the deleted notification was unread
            const deletedNotification = notifications.find(n => n.id === id);
            if (deletedNotification && !deletedNotification.read_at) {
                setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = (now - date) / 1000;
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'user_registered':
                return <UserPlusIcon className="h-5 w-5 text-purple-500" />;
            case 'course_enrollment':
                return <BookOpenIcon className="h-5 w-5 text-green-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    const getNotificationAction = (notification) => {
        switch (notification.data.type) {
            case 'user_registered':
                return `/admin/users/${notification.data.user_id}`;
            case 'course_enrollment':
                return `/courses/${notification.data.course_id}`;
            default:
                return '#';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.read_at;
        return notification.data.type === activeTab;
    });
     if (isLoading) {
        return (
            <div className="flex h-screen bg-white">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    {/* Code brackets with logo */}
                    <div className="flex items-center mb-8">
                        <span className="text-5xl text-gray-400 font-mono mr-2">{'</'}</span>
                        <span className="text-4xl font-bold tracking-wider">
                            <span className="text-blue-600">Code</span>
                            <span className="text-blue-800">Dev</span>
                        </span>
                        <span className="text-5xl text-gray-400 font-mono ml-2">{'>'}</span>
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
                            Loading notifications...
                        </span>
                    </p>
                </div>
            </div>
        );
    }   
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center">
                            <BellIcon className="h-6 w-6 text-gray-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`px-3 py-1 text-sm rounded-md ${unreadCount === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                            >
                                Mark all as read
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'unread' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Unread
                            </button>
                            <button
                                onClick={() => setActiveTab('user_registered')}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'user_registered' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                New Users
                            </button>
                            <button
                                onClick={() => setActiveTab('course_enrollment')}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'course_enrollment' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Enrollments
                            </button>
                        </nav>
                    </div>
                    
                    {/* Notification List */}
                    <div className="divide-y divide-gray-200">
                        {error ? (
                            <div className="p-8 text-center text-red-500">
                                <AlertTriangleIcon className="mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-medium">{error}</h3>
                                <button
                                    onClick={() => fetchNotifications(1, true)}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : isLoading && notifications.length === 0 ? (
                            <div className="p-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {activeTab === 'all' 
                                        ? "You don't have any notifications yet." 
                                        : activeTab === 'unread' 
                                            ? "You've read all your notifications." 
                                            : `No ${activeTab.replace('_', ' ')} notifications.`}
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {filteredNotifications.map(notification => (
                                    <li 
                                        key={notification.id}
                                        className={`hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50' : ''}`}
                                    >
                                        <Link 
                                            to={getNotificationAction(notification)}
                                            onClick={() => !notification.read_at && markAsRead(notification.id)}
                                            className="block px-6 py-4"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    {getNotificationIcon(notification.data.type)}
                                                </div>
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.data.message}
                                                    </p>
                                                    <div className="mt-1 flex items-center text-xs text-gray-500">
                                                        <ClockIcon className="flex-shrink-0 mr-1 h-3 w-3" />
                                                        {formatTime(notification.created_at)}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex-shrink-0 flex space-x-2">
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="text-gray-400 hover:text-gray-500"
                                                            title="Mark as read"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            deleteNotification(notification.id, e);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-500"
                                                        title="Delete"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {hasMore && !isLoading && filteredNotifications.length > 0 && (
                            <div className="px-6 py-4 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                                >
                                    Load more notifications
                                </button>
                            </div>
                        )}
                        
                        {isLoading && notifications.length > 0 && (
                            <div className="px-6 py-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 inline-block"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;