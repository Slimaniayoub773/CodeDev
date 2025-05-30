<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index()
    {
        $comments = Comment::with(['utilisateur:id,name', 'lesson:id,title'])->get();
        return response()->json($comments);
    }
    public function store(Request $request)
    {
        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'content' => 'required|string|max:1000',
        ]);

        return Comment::create([
            'lesson_id' => $request->lesson_id,
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);
    }
    public function destroy($id)
    {
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }
        $comment->delete();
        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
