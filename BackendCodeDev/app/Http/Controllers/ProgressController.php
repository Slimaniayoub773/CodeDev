<?php
namespace App\Http\Controllers;

use App\Models\Progress;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function index()
    {
        // Fetch all progress records
        return response()->json(Progress::with(['user', 'course'])->get());
    }

    public function store(Request $request)
    {
        // Validate and create progress record
        $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'course_id' => 'required|exists:courses,id',
            'completed_lessons' => 'required|array',
        ]);

        $progress = Progress::create($request->all());

        return response()->json($progress, 201);
    }

    public function update(Request $request, Progress $progress)
    {
        // Validate and update progress record
        $request->validate([
            'completed_lessons' => 'required|array',
        ]);

        $progress->update($request->all());

        return response()->json($progress);
    }

    public function destroy(Progress $progress)
    {
        // Delete progress record
        $progress->delete();

        return response()->json(null, 204);
    }
}
