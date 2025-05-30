<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\UserCourse;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserCourseController extends Controller
{
    public function index()
    {
        // Fetch all user courses with related data (users and courses)
        $userCourses = UserCourse::with(['utilisateur', 'course'])->get();
        return response()->json($userCourses);
    }

    public function store(Request $request)
{
    // التحقق من صحة البيانات المدخلة
    $validated = $request->validate([
        'utilisateur_id' => 'required|exists:utilisateurs,id',
        'course_id' => 'required|exists:courses,id',
        'inscription_date' => 'nullable|date',
        'status' => 'nullable|string',
    ]);

    // التحقق من وجود اشتراك مسبق
    $existing = UserCourse::where('utilisateur_id', $validated['utilisateur_id'])
        ->where('course_id', $validated['course_id'])
        ->first();

    if ($existing) {
        return response()->json(['message' => 'أنت مشترك بالفعل في هذه الدورة.'], 409);
    }

    // تعيين الحالة الافتراضية إذا لم تكن صالحة
    $statusMapping = [
        'En attente' => 'En attente',
        'Complété' => 'Complété',
        'Annulé' => 'Annulé',
    ];
    $validated['status'] = $statusMapping[$validated['status']] ?? 'En attente';

    // إنشاء الاشتراك الجديد
    $userCourse = UserCourse::create($validated);

    // Get the user and course models
    $user = Utilisateur::find($validated['utilisateur_id']);
    $course = Course::find($validated['course_id']);

    // Send notification to admin (or whoever should receive it)
    // You'll need to determine who should be notified - here I'm assuming User 1 is admin
    $admin = Utilisateur::find(1);
    $admin->notify(new \App\Notifications\NewCourseEnrollment($user, $course));

    return response()->json($userCourse, 201);
}

    public function show($id)
    {
        // Fetch a single user-course relation
        $userCourse = UserCourse::with(['utilisateur', 'course'])->findOrFail($id);
        return response()->json($userCourse);
    }

    public function update(Request $request, $id)
    {
        // Validate the request data
        $validated = $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'course_id' => 'required|exists:courses,id',
            'inscription_date' => 'nullable|date',
            'status' => 'nullable|string',
        ]);
    
        // Map frontend status to database enum value
        $statusMapping = [
            'En attente' => 'En attente',
            'Complété' => 'Complété',
            'Annulé' => 'Annulé',
        ];
    
    
        $validated['status'] = $statusMapping[$validated['status']] ?? 'En attente';  // Default to 'En attente' if status is not valid
    

        // Find the user-course relation and update it
        $userCourse = UserCourse::findOrFail($id);
        $userCourse->update($validated);

        return response()->json($userCourse);
    }

    public function destroy($id)
    {
        // Find and delete the user-course relation
        $userCourse = UserCourse::findOrFail($id);
        $userCourse->delete();

        return response()->json(['message' => 'Inscription supprimée']);
    }
    public function check(Request $request)
{
    $exists = UserCourse::where('utilisateur_id', $request->utilisateur_id)
        ->where('course_id', $request->course_id)
        ->exists();

    return response()->json(['enrolled' => $exists]);
}
public function userCourses()
{
    $user = Auth::user();
    
    $courses = $user->courses()->with('course')->get()->map(function ($userCourse) {
        return [
            'id' => $userCourse->course->id,
            'title' => $userCourse->course->title,
            'description' => $userCourse->course->description,
            'image' => $userCourse->course->image,
            'status' => $userCourse->status,
            'inscription_date' => $userCourse->inscription_date,
            'completed_at' => $userCourse->completed_at,
        ];
    });

    return response()->json($courses);
}
}
