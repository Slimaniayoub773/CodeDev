<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class CommentsSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        
        $utilisateurs = DB::table('utilisateurs')->pluck('id');
        $lessons = DB::table('lessons')->pluck('id');

        for ($i = 0; $i < 10; $i++) {
            DB::table('comments')->insert([
                'utilisateur_id' => $faker->randomElement($utilisateurs), 
                'lesson_id' => $faker->randomElement($lessons), 
                'text' => $faker->paragraph(), 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
