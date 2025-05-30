<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
{
    $request->validate([
        'course_id' => 'required|exists:courses,id'
    ]);
        
    return Quiz::where('course_id', $request->course_id)->get();
}

    public function Afficher(){
        return response()->json(Quiz::all());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'question' => 'required|string',
            'option_1' => 'required|string',
            'option_2' => 'required|string',
            'option_3' => 'required|string',
            'option_4' => 'required|string',
            'correct_answer' => 'required|string',
        ]);

        $quiz = Quiz::create($validated);

        return response()->json($quiz, 201);
    }

    public function show($id)
    {
        return Quiz::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'question' => 'required|string',
            'option_1' => 'required|string',
            'option_2' => 'required|string',
            'option_3' => 'required|string',
            'option_4' => 'required|string',
            'correct_answer' => 'required|string',
            'explanation' => 'nullable|string',
            'code_snippet' => 'nullable|string'
        ]);

        $quiz = Quiz::findOrFail($id);
        $quiz->update($validated);

        return response()->json($quiz);
    }

    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json(null, 204);
    }

    public function iscorrect(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'selected_answer' => 'required|string',
        ]);

        $quiz = Quiz::findOrFail($request->quiz_id);
        
        return response()->json([
            'is_correct' => $quiz->correct_answer === $request->selected_answer,
            'correct_answer' => $quiz->correct_answer,
            'explanation' => $quiz->explanation
        ]);
    }
}   