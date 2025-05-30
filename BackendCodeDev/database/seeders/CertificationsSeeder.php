<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Utilisateur;
use App\Models\Course;
use Carbon\Carbon;

class CertificationsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get verified users (excluding blocked ones)
        $users = Utilisateur::where('email_verified_at', '!=', null)
                          ->where('is_blocked', false)
                          ->inRandomOrder()
                          ->limit(25)
                          ->get();

        // Get all courses
        $courses = Course::all();

        if ($users->isEmpty() || $courses->isEmpty()) {
            $this->call([
                UtilisateurSeeder::class,
                CoursesSeeder::class,
            ]);
            $users = Utilisateur::where('email_verified_at', '!=', null)
                              ->where('is_blocked', false)
                              ->inRandomOrder()
                              ->limit(25)
                              ->get();
            $courses = Course::all();
        }

        $certifications = [];
        $certificationTypes = [
            'React' => [
                'React Developer Certification',
                'React Professional Certificate',
                'Advanced React Specialist',
                'React Hooks Master Certification'
            ],
            'Laravel' => [
                'Laravel Developer Certification',
                'Laravel API Specialist',
                'Laravel Eloquent Expert',
                'Certified Laravel Professional'
            ],
            'Express.js' => [
                'Express.js Developer Certification',
                'Node.js with Express Specialist',
                'REST API with Express Certificate'
            ],
            'Python' => [
                'Python Programming Certificate',
                'Python Developer Certification',
                'Advanced Python Specialist'
            ],
            'MySQL' => [
                'MySQL Database Certification',
                'SQL Query Expert Certificate',
                'Database Design Specialist'
            ],
            'JavaScript' => [
                'JavaScript Developer Certification',
                'Modern JavaScript Specialist',
                'ES6+ Master Certificate'
            ],
            'PHP' => [
                'PHP Developer Certification',
                'Web Development with PHP Certificate',
                'Advanced PHP Patterns Specialist'
            ],
            'HTML' => [
                'HTML5 & CSS3 Certification',
                'Frontend Web Development Certificate',
                'Responsive Design Specialist'
            ],
            'CSS' => [
                'Advanced CSS Specialist',
                'CSS Animations Master',
                'Modern Layout Techniques Certificate'
            ],
            'Bootstrap' => [
                'Bootstrap Framework Certification',
                'Responsive Design with Bootstrap',
                'Frontend Components Specialist'
            ],
            'Tailwind CSS' => [
                'Tailwind CSS Specialist',
                'Utility-First CSS Master',
                'Tailwind Component Design Certificate'
            ],
            'Git' => [
                'Version Control with Git Certification',
                'GitHub Collaboration Specialist',
                'Advanced Git Techniques Certificate'
            ]
        ];

        foreach ($users as $user) {
            // Each user gets 1-4 certifications
            $certCount = rand(1, min(4, $courses->count()));
            $selectedCourses = $courses->random($certCount);

            foreach ($selectedCourses as $course) {
                // Determine course type for certification title
                $courseType = 'Other';
                foreach ($certificationTypes as $key => $titles) {
                    if (str_contains($course->title, $key)) {
                        $courseType = $key;
                        break;
                    }
                }

                $titleOptions = $certificationTypes[$courseType] ?? ['Course Completion Certificate'];
                $title = $titleOptions[array_rand($titleOptions)];

                $certifications[] = [
                    'utilisateur_id' => $user->id,
                    'course_id' => $course->id,
                    'issue_date' => $this->generateIssueDate($course),
                    'score' => $this->generateRealisticScore(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Stop if we've reached 20 certifications
                if (count($certifications) >= 20) {
                    break 2;
                }
            }
        }

        DB::table('certifications')->insert($certifications);
    }

    /**
     * Generate a realistic issue date based on course dates
     */
    protected function generateIssueDate($course): string
    {
        $start = Carbon::parse($course->start_date);
        $end = Carbon::parse($course->end_date);
        
        // Certification is issued between start date and 30 days after end date
        return $end->addDays(rand(0, 30))->format('Y-m-d');
    }

    /**
     * Generate realistic scores with normal distribution
     */
    protected function generateRealisticScore(): int
    {
        // Base score (70-100) with bell curve around 85
        $score = (int) min(100, max(70, round(
    85 + rand(-15, 15) + rand(-5, 5)
)));

        
        // Round to nearest 5 for more realistic distribution
        return round($score / 5) * 5;
    }
}