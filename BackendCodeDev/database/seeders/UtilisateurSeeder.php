<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Keep your original admin user exactly as you had it
        DB::table('utilisateurs')->insert([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('Admin123'),
            'role' => 'admin',
            'is_blocked' => false,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create 40 random users with improved data
        for ($i = 0; $i < 40; $i++) {
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;
            $email = strtolower($firstName[0] . $lastName) . $faker->randomNumber(2) . '@' . $faker->freeEmailDomain;
            
            // Fixed role assignment with 80/20 distribution
            $role = ($i < 32) ? 'user' : 'admin'; // First 32 users (80%) will be 'user', last 8 (20%) will be 'admin'
            
            DB::table('utilisateurs')->insert([
                'name' => $firstName . ' ' . $lastName,
                'email' => $email,
                'password' => Hash::make('Password' . $faker->randomNumber(4)),
                'role' => $role,
                'is_blocked' => $faker->optional(0.15, false)->randomElement([true, false]),
                'email_verified_at' => $faker->optional(0.9, null)->dateTimeThisYear(),
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
                'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);
        }

        // Add a standard test user
        DB::table('utilisateurs')->insert([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('TestUser123'),
            'role' => 'user',
            'is_blocked' => false,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}