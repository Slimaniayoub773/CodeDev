<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactReply;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        ContactMessage::create($validator->validated());

        return response()->json([
            'message' => 'Message sent successfully!'
        ], 201);
    }

    public function index()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    public function show($id)
    {
        $message = ContactMessage::findOrFail($id);
        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['read' => true]);
        return response()->json(['message' => 'Message marked as read']);
    }

public function reply($id, Request $request)
{
    $request->validate([
        'reply' => 'required|string|max:5000'
    ]);

    $message = ContactMessage::findOrFail($id);
    
    try {
        Mail::to($message->email)
            ->send(new ContactReply($message, $request->reply));
        
        $message->update([
            'replied' => true,
            'read' => true
        ]);

        return response()->json(['message' => 'Reply sent successfully']);
    } catch (\Exception $e) {
        \Log::error('Failed to send reply: '.$e->getMessage());
        return response()->json([
            'message' => 'Failed to send email',
            'error' => $e->getMessage()
        ], 500);
    }
}
}