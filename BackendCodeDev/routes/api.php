<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\Lesson;
use App\Models\Utilisateur;
use App\Http\Controllers\{
    AuthController,
    LessonController,
    CourseController,
    UtilisateurController,
    ProgressController,
    CommentController,
    QuizController,
    UserCourseController,
    CertificationController,
    ContactController,
    DashboardController,
    NotificationController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public resource routes
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{course}', [CourseController::class, 'show']);
Route::get('/courses/{id}/lessons', [CourseController::class, 'lessons']);
Route::get('/lessons', [LessonController::class, 'index']);
Route::get('/quizzes', [QuizController::class, 'Afficher']);
Route::get('/comments', [CommentController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/user-courses/check', [UserCourseController::class, 'check']);
Route::patch('/lessons/{lesson}', [LessonController::class, 'oneupdate']);
// Authenticated routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/profile', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user', [UtilisateurController::class, 'updateProfile']);
    Route::get('/user/certificates', [CertificationController::class, 'getUserCertificates']);
    // Courses
    Route::post('/courses/{id}/rate', [CourseController::class, 'rate']);
    Route::post('/courses/{course}/rate', [CourseController::class, 'rateCourse'])->name('courses.rate');
    
    // Comments
    Route::post('/comments', [CommentController::class, 'store']);
    
    // User courses
    Route::get('/user/courses', [UserCourseController::class, 'userCourses']);
    
    Route::prefix('user-courses')->group(function () {
        Route::post('/', [UserCourseController::class, 'store']);
        Route::get('{id}', [UserCourseController::class, 'show']);
    });
    
    // Quizzes
    
    Route::post('/quizzes/submit', [QuizController::class, 'store']);
    Route::post('/submitQuiz', [CertificationController::class, 'submitQuiz']);
    Route::get('/quizzesu', [QuizController::class, 'index']);
    // Certifications
    Route::get('/certifications/{id}', [CertificationController::class, 'show']);
    Route::get('/certifications/{id}/download', [CertificationController::class, 'downloadCertificate']);
    Route::post('/certifications/generate', [CertificationController::class, 'generateCertificate']);
    Route::get('/user/certificates', [CertificationController::class, 'getUserCertificates']);
    Route::get('/certifications/by-course/{courseId}', [CertificationController::class, 'getByCourse']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Contact messages (admin)
    Route::group(['middleware' => ['admin']], function() {
        Route::get('/contact-messages', [ContactController::class, 'index']);
        Route::get('/contact-messages/{id}', [ContactController::class, 'show']);
        Route::delete('/contact-messages/{id}', [ContactController::class, 'destroy']);
        Route::patch('/contact-messages/{id}/mark-as-read', [ContactController::class, 'markAsRead']);
        Route::post('/contact-messages/{id}/reply', [ContactController::class, 'reply']);
    });
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Lessons
    Route::post('/lessons', [LessonController::class, 'store']);
    Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);
    
    // Courses
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::get('/utilisateurs/blocked', [UtilisateurController::class, 'getBlockedUsers']);
    // Users
    Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
    Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);
    Route::patch('/utilisateurs/{id}/block', [UtilisateurController::class, 'toggleBlock']);
    Route::get('/utilisateurs/tg', [UtilisateurController::class, 'blocked']);
    
    // Quizzes
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    
    // Comments
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    
    // Certifications
    Route::prefix('certifications')->group(function () {
        Route::get('/', [CertificationController::class, 'index']);
        Route::post('/', [CertificationController::class, 'store']);
        Route::put('{id}', [CertificationController::class, 'update']);
        Route::delete('{id}', [CertificationController::class, 'destroy']);
    });
    
    // User courses
    Route::prefix('user-courses')->group(function () {
        Route::get('/', [UserCourseController::class, 'index']);
        Route::put('{id}', [UserCourseController::class, 'update']);
        Route::delete('{id}', [UserCourseController::class, 'destroy']);
    });
    
    // Dashboard stats
    Route::get('/stats', function() {
        $totalStudents = DB::table('utilisateurs')->where('role', 'user')->count();
        $totalCourses = DB::table('courses')->count();
        $completed = DB::table('user_courses')->where('status', 'Complété')->count();
        $pending = DB::table('user_courses')->where('status', 'En attente')->count();
        $certificatesIssued = DB::table('certifications')->count();
        
        $activeStudents = DB::table('utilisateurs')
            ->where('role', 'user')
            ->whereExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('user_courses')
                      ->whereColumn('user_courses.utilisateur_id', 'utilisateurs.id')
                      ->where('user_courses.updated_at', '>', now()->subDays(30));
            })
            ->count();

        return response()->json([
            'totalStudents' => $totalStudents,
            'totalCourses' => $totalCourses,
            'completed' => $completed,
            'pending' => $pending,
            'activeStudents' => $activeStudents,
            'certificatesIssued' => $certificatesIssued
        ]);
    });
    
    Route::get('/monthly-registrations', function() {
        $data = DB::table('user_courses')
            ->selectRaw('MONTHNAME(created_at) as month, COUNT(*) as registrations')
            ->groupBy('month')
            ->orderByRaw('MIN(created_at)')
            ->get();
        
        return response()->json($data);
    });
    
    Route::get('/top-courses', function() {
        $data = DB::table('courses')
            ->join('user_courses', 'courses.id', '=', 'user_courses.course_id')
            ->selectRaw('courses.title as course, COUNT(*) as students')
            ->groupBy('courses.title')
            ->orderByDesc('students')
            ->limit(5)
            ->get();
            
        return response()->json($data); 
    });
    
    Route::get('/student-activity', function() {
        $activity = DB::table('user_courses')
            ->join('utilisateurs', 'user_courses.utilisateur_id', '=', 'utilisateurs.id')
            ->join('courses', 'user_courses.course_id', '=', 'courses.id')
            ->select(
                'utilisateurs.name as student',
                'utilisateurs.email',
                'courses.title as course',
                'user_courses.status',
                'user_courses.updated_at as lastActivity',
                DB::raw('CASE 
                    WHEN user_courses.status = "Complété" THEN 100
                    ELSE FLOOR(RAND() * 90) + 10
                END as progress')
            )
            ->orderBy('user_courses.updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'student' => $item->student,
                    'email' => $item->email,
                    'course' => $item->course,
                    'status' => $item->status,
                    'lastActivity' => Carbon::parse($item->lastActivity)->diffForHumans(),
                    'progress' => $item->progress
                ];
            });

        return response()->json([
            'activeStudents' => DB::table('utilisateurs')
                ->where('role', 'user')
                ->whereExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('user_courses')
                          ->whereColumn('user_courses.utilisateur_id', 'utilisateurs.id')
                          ->where('user_courses.updated_at', '>', now()->subDays(30));
                })
                ->count(),
            'activity' => $activity
        ]);
    });
    
    Route::get('/student-progress', function() {
        return DB::table('courses')
            ->select(
                'courses.title as subject',
                DB::raw('COUNT(user_courses.id) as total_enrollments'),
                DB::raw('ROUND(
                    (SUM(CASE WHEN user_courses.status = "Complété" THEN 100 ELSE 25 END)) / 
                    COUNT(user_courses.id)
                ) as progress')
            )
            ->leftJoin('user_courses', 'courses.id', '=', 'user_courses.course_id')
            ->groupBy('courses.id', 'courses.title')
            ->orderBy('total_enrollments', 'desc')
            ->limit(6)
            ->get();
    });
    
    Route::get('/testEnnah', function () {
        return response()->json(Auth::guard('api')->user()->role);
    });
});