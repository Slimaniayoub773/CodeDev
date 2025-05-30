<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            // React
            [
                'title' => 'React Mastery: From Basics to Advanced',
                'description' => 'Comprehensive React course covering hooks, context API, Redux, React Router, and advanced patterns. Build real-world applications with modern React.',
                'image' => 'courses/react.jpg',
                'start_date' => Carbon::now()->addDays(7),
                'end_date' => Carbon::now()->addDays(90),
                'rating' => 4.8,
                'rating_count' => 2450,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Laravel
            [
                'title' => 'Laravel 10: Complete Developer Guide',
                'description' => 'Master Laravel from fundamentals to advanced topics including Eloquent, Blade, Artisan, Queues, and API development. Build robust web applications.',
                'image' => 'courses/laravel.jpg',
                'start_date' => Carbon::now()->addDays(5),
                'end_date' => Carbon::now()->addDays(85),
                'rating' => 4.7,
                'rating_count' => 1890,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Express.js
            [
                'title' => 'Express.js: The Complete Developer Course',
                'description' => 'Learn to build fast, scalable web applications with Express.js. Covers middleware, routing, authentication, error handling, and deployment.',
                'image' => 'courses/express.jpg',
                'start_date' => Carbon::now()->addDays(10),
                'end_date' => Carbon::now()->addDays(70),
                'rating' => 4.6,
                'rating_count' => 1250,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Python (2 courses)
            [
                'title' => 'Python Programming: Beginner to Pro',
                'description' => 'Learn Python programming from scratch. Covers syntax, data structures, OOP, file handling, and popular libraries like NumPy and Pandas.',
                'image' => 'courses/python-beginner.jpg',
                'start_date' => Carbon::now()->addDays(3),
                'end_date' => Carbon::now()->addDays(60),
                'rating' => 4.7,
                'rating_count' => 3200,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Advanced Python: Expert Techniques',
                'description' => 'Master advanced Python concepts including decorators, generators, metaclasses, concurrency, and performance optimization.',
                'image' => 'courses/python-advanced.jpg',
                'start_date' => Carbon::now()->addDays(20),
                'end_date' => Carbon::now()->addDays(100),
                'rating' => 4.8,
                'rating_count' => 980,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // MySQL
            [
                'title' => 'MySQL Database: Complete Developer Course',
                'description' => 'Master MySQL database design, queries, optimization, and administration. Learn joins, indexes, stored procedures, and transactions.',
                'image' => 'courses/mysql.jpg',
                'start_date' => Carbon::now()->addDays(8),
                'end_date' => Carbon::now()->addDays(65),
                'rating' => 4.5,
                'rating_count' => 1450,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // JavaScript
            [
                'title' => 'Modern JavaScript: ES6+ Mastery',
                'description' => 'Master modern JavaScript features including ES6+, async/await, modules, promises, and functional programming patterns.',
                'image' => 'courses/javascript.jpg',
                'start_date' => Carbon::now()->addDays(4),
                'end_date' => Carbon::now()->addDays(75),
                'rating' => 4.7,
                'rating_count' => 2750,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // PHP (2 courses)
            [
                'title' => 'PHP for Web Development',
                'description' => 'Learn PHP from basics to advanced topics. Covers OOP, MVC, form handling, sessions, and building dynamic websites.',
                'image' => 'courses/php-basic.jpg',
                'start_date' => Carbon::now()->addDays(6),
                'end_date' => Carbon::now()->addDays(80),
                'rating' => 4.4,
                'rating_count' => 1650,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Advanced PHP: Patterns and Performance',
                'description' => 'Advanced PHP techniques including design patterns, SOLID principles, caching, security, and performance optimization.',
                'image' => 'courses/php-advanced.jpg',
                'start_date' => Carbon::now()->addDays(25),
                'end_date' => Carbon::now()->addDays(110),
                'rating' => 4.6,
                'rating_count' => 850,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // HTML
            [
                'title' => 'HTML5 & CSS3: Modern Web Design',
                'description' => 'Master HTML5 and CSS3 to build responsive, accessible websites. Covers Flexbox, Grid, animations, and responsive design principles.',
                'image' => 'courses/html-css.jpg',
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addDays(45),
                'rating' => 4.6,
                'rating_count' => 2100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // CSS (New)
            [
                'title' => 'Advanced CSS: Modern Techniques',
                'description' => 'Master advanced CSS including custom properties, transitions, transforms, animations, and modern layout techniques.',
                'image' => 'courses/css-advanced.jpg',
                'start_date' => Carbon::now()->addDays(12),
                'end_date' => Carbon::now()->addDays(55),
                'rating' => 4.7,
                'rating_count' => 1350,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Bootstrap
            [
                'title' => 'Bootstrap 5: Complete Frontend Framework',
                'description' => 'Master Bootstrap 5 to quickly build responsive websites. Covers utilities, components, grid system, and customization.',
                'image' => 'courses/bootstrap.jpg',
                'start_date' => Carbon::now()->addDays(9),
                'end_date' => Carbon::now()->addDays(50),
                'rating' => 4.5,
                'rating_count' => 1750,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Tailwind CSS (New)
            [
                'title' => 'Tailwind CSS: Modern Utility-First CSS',
                'description' => 'Learn to build beautiful, responsive designs with Tailwind CSS. Master utility-first workflow, customization, and component creation.',
                'image' => 'courses/tailwind.jpg',
                'start_date' => Carbon::now()->addDays(11),
                'end_date' => Carbon::now()->addDays(65),
                'rating' => 4.8,
                'rating_count' => 1950,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Git
            [
                'title' => 'Git & GitHub: Complete Version Control',
                'description' => 'Master Git version control and GitHub collaboration. Learn branching, merging, rebasing, pull requests, and team workflows.',
                'image' => 'courses/git.jpg',
                'start_date' => Carbon::now()->addDays(1),
                'end_date' => Carbon::now()->addDays(30),
                'rating' => 4.8,
                'rating_count' => 2900,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('courses')->insert($courses);
    }
}