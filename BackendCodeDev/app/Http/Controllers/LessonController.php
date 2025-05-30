<?php
namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    // Fetch all lessons
    public function index()
    {
        return Lesson::with('course')->get();
    }

    // Create a new lesson
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string',
            'explain' => 'required|string',
            'code_chunk' => 'nullable|string',
            'is_completed' => 'boolean'
        ]);

        $lesson = Lesson::create($request->all());

        return response()->json($lesson, 201);
    }

    // Update an existing lesson
    public function update(Request $request, Lesson $lesson)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string',
            'explain' => 'required|string',
            'code_chunk' => 'nullable|string',
            'is_completed' => 'boolean'
        ]);

        $lesson->update($request->all());

        return response()->json($lesson);
    }
    public function oneupdate(Request $request, Lesson $lesson)
{
    $validated = $request->validate([
        'is_completed' => 'sometimes|boolean'
    ]);
    
    $lesson->update($validated);
    
    return response()->json($lesson);
}
    // Delete a lesson
    public function destroy(Lesson $lesson)
    {
        $lesson->delete();

        return response()->json(null, 204);
    }
}