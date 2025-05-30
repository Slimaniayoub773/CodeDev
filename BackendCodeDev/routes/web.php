<?php
use App\Models\Lesson;
use App\Http\Controllers\LessonController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use Illuminate\Http\Request;
use App\Http\Controllers\UtilisateurController;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/courses', [CourseController::class, 'index'])->name('index');
Route::get('/courses/create', [CourseController::class, 'create'])->name('create');
Route::post('/courses', [CourseController::class, 'store'])->name('store');
Route::get('/courses/{id}/lessons', [LessonController::class, 'show'])->name('lessons.show');


Route::get('/lessons/{id}', function ($id) {
    return response()->json(Lesson::findOrFail($id));
});

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne !']);
});
Route::get('/csrf-token', function (Request $request) {
    return response()->json(['csrf_token' => csrf_token()]);
});
Route::get('/test-mail', function() {
    try {
        Mail::raw('This is a test email', function($message) {
            $message->to('ayoubslimani773@gmail.com')->subject('Test Email');
        });
        return 'Email sent successfully';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
    
});
Route::get('/test-email', function() {
    try {
        Mail::to('ayoubslimani773@gmail.com')->send(new App\Mail\PasswordResetMail('http://yourfrontendurl.com/reset-password?token=test123'));
        return "Test email sent to ayoubslimani773@gmail.com - please check your inbox and spam folder";
    } catch (\Exception $e) {
        return "Error sending email: " . $e->getMessage();
    }
});