<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Models\Quiz;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    public function index()
    {
        return response()->json(Certification::with(['utilisateur', 'course'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'course_id' => 'required|exists:courses,id',
            'issue_date' => 'required|date',
            'score' => 'required|integer|min:0|max:100'
        ]);

        $certification = Certification::create($validated);
        
        return response()->json($certification, 201);
    }

    public function show($id)
    {
        $certification = Certification::with(['utilisateur', 'course'])->findOrFail($id);
        
        if (auth()->id() != $certification->utilisateur_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json([
            'certification' => $certification,
            'date' => now()->format('F j, Y')
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $certification = Certification::findOrFail($id);
            
            $validated = $request->validate([
                'utilisateur_id' => 'sometimes|required|exists:utilisateurs,id',
                'course_id' => 'sometimes|required|exists:courses,id',
                'issue_date' => 'sometimes|required|date',
                'score' => 'sometimes|required|integer|min:0|max:100'
            ]);

            $certification->update($validated);
            
            return response()->json($certification);
            
        } catch (\Exception $e) {
            \Log::error('Error updating certification: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $certification = Certification::findOrFail($id);
        $certification->delete();

        return response()->json(null, 204);
    }

    public function downloadCertificate($id)
    {
        $certification = Certification::with(['utilisateur', 'course'])->findOrFail($id);
        
        return response()->json([
            'certification' => $certification,
            'date' => now()->format('F j, Y')
        ]);
    }

    public function getByCourse($courseId)
    {
        try {
            \Log::info('Attempting to fetch certification for course: ' . $courseId);
            
            $user = auth()->user();
            if (!$user) {
                \Log::warning('Unauthenticated user attempted to access certification');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            \Log::info('User authenticated: ' . $user->id);

            $certification = Certification::with(['utilisateur', 'course'])
                ->where('course_id', $courseId)
                ->where('utilisateur_id', $user->id)
                ->first();

            if (!$certification) {
                \Log::info('No certification found for user ' . $user->id . ' and course ' . $courseId);
                return response()->json([
                    'error' => 'Certificate not found or not earned yet'
                ], 404);
            }

            \Log::info('Certification found: ' . $certification->id);
            return response()->json([
                'certification' => $certification
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in getByCourse: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function submitQuiz(Request $request)
    {
        $validated = $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'course_id' => 'required|exists:courses,id',
            'score' => 'required|integer|min:0|max:100'
        ]);

        $quizResult = Certification::updateOrCreate(
            [
                'utilisateur_id' => $validated['utilisateur_id'],   
                'course_id' => $validated['course_id']
            ],
            [
                'score' => $validated['score'],
                'issue_date' => now() 
            ]
        );

        return response()->json([
            'success' => true,
            'quiz_result' => $quizResult
        ]);
    }
public function getUserCertificates()
{
    try {
        $user = auth()->user();
        
        $certificates = Certification::with(['course'])
            ->where('utilisateur_id', $user->id)
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function($cert) {
                return [
                    'id' => $cert->id,
                    'course_title' => $cert->course->title,
                    'issue_date' => $cert->issue_date,
                    'score' => $cert->score,
                    'course_id' => $cert->course_id // Add course_id for routing
                ];
            });

        return response()->json($certificates);
        
    } catch (\Exception $e) {
        \Log::error('Error in getUserCertificates: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to fetch certificates',
            'message' => $e->getMessage()
        ], 500);
    }
}
}