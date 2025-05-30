<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Utilisateur;
use App\Models\Lesson;
use App\Models\Progress;

class DashboardController extends Controller
{
    public function getDashboardStats()
    {
        // Fetch the statistics data from the database
        $courses = Course::count(); // Total courses
        $students = Utilisateur::count(); // Total students
        $lessons = Lesson::count(); // Total lessons
        $progress = Progress::count(); // Total progress records

        // Return the data in response
        return response()->json([
            'courses' => $courses,
            'students' => $students,
            'lessons' => $lessons,
            'progress' => $progress,
        ]);
    }
}
