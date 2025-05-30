<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    // 🟢 عرض جميع الكورسات
    public function index()
    {
        return Course::all();
    }

    // 🟢 إنشاء كورس جديد مع رفع صورة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'rating' => 'nullable|numeric|between:0,5',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('courses', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $course = Course::create($validated);
        return response()->json($course, 201);
    }

    // 🟢 عرض كورس واحد
    public function show(Course $course)
    {
        return $course;
    }

    // 🟢 تحديث كورس مع إمكانية تغيير الصورة
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'rating' => 'nullable|numeric|between:0,5',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image && file_exists(public_path($course->image))) {
                unlink(public_path($course->image));
            }

            $imagePath = $request->file('image')->store('courses', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        $course->update($validated);
        return response()->json($course, 200);
    }

    // 🟢 حذف كورس مع حذف الصورة
    public function destroy(Course $course)
    {
        if ($course->image && file_exists(public_path($course->image))) {
            unlink(public_path($course->image));
        }

        $course->delete();
        return response()->json(null, 204);
    }
    public function rate($id, Request $request)
{
    $request->validate([
        'rating' => 'required|numeric|between:1,5'
    ]);

    $course = Course::findOrFail($id);
    
    // Calculate new rating
    $currentTotal = $course->rating * $course->rating_count;
    $newRatingCount = $course->rating_count + 1;
    $newRating = ($currentTotal + $request->rating) / $newRatingCount;

    // Update course
    $course->update([
        'rating' => round($newRating, 2),
        'rating_count' => $newRatingCount
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Rating submitted successfully',
        'new_rating' => round($newRating, 2),
        'rating_count' => $newRatingCount
    ]);
}
public function lessons($id)
{
    // التحقق من وجود الدورة أولاً
    $course = Course::findOrFail($id);
    
    // الحصول على الدروس مع الترتيب الصحيح
    $lessons = Lesson::where('course_id', $id)
                ->orderBy('created_at', 'asc')
                ->get();
                
    return response()->json($lessons);
}
public function rateCourse(Request $request, $courseId)
{
    $request->validate([
        'rating' => 'required|integer|between:1,5'
    ]);

    $course = Course::findOrFail($courseId);
    
    // Calculate new rating
    $newCount = $course->rating_count + 1;
    $newRating = (($course->rating * $course->rating_count) + $request->rating) / $newCount;

    // Update course
    $course->update([
        'rating' => $newRating,
        'rating_count' => $newCount
    ]);

    return response()->json([
        'success' => true,
        'new_rating' => $newRating,
        'rating_count' => $newCount,
        'message' => 'Rating submitted successfully'
    ]);
}
}
