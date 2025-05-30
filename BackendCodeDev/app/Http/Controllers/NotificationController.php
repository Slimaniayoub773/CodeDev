<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    const PER_PAGE = 15;

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = $user->notifications()->orderBy('created_at', 'desc');
        
        // Apply filters
        if ($request->filter === 'unread') {
            $query->whereNull('read_at');
        } elseif (in_array($request->filter, ['user_registered', 'course_enrollment', 'system_alert'])) {
            $query->where('data->type', $request->filter);
        }
        
        $notifications = $query->paginate(self::PER_PAGE);
        
        return response()->json([
            'notifications' => $notifications->items(),
            'unread_count' => $user->unreadNotifications()->count(),
            'has_more' => $notifications->hasMorePages(),
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();
        
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }
        
        return response()->json(['error' => 'Notification not found'], 404);
    }

    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();
        
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }
        
        $wasUnread = is_null($notification->read_at);
        $notification->delete();
        
        return response()->json([
            'success' => true,
            'was_unread' => $wasUnread
        ]);
    }
}