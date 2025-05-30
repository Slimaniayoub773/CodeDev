<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserCoursesSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $utilisateurs = DB::table('utilisateurs')->pluck('id');
        $courses = DB::table('courses')->pluck('id');

        for ($i = 0; $i < 10; $i++) {
            DB::table('user_courses')->insert([
                'utilisateur_id' => $faker->randomElement($utilisateurs),
                'course_id' => $faker->randomElement($courses), 
                'inscription_date' => $faker->date(), 
                'status' => $faker->randomElement(['En attente', 'Complété', 'Annulé']),
                'completed_at' => $faker->boolean() ? $faker->date() : null, 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
