# CodeDev Backend API

![Laravel API](https://via.placeholder.com/800x400?text=Laravel+API)

Laravel REST API for CodeDev platform.

## 🛠 Setup

### Requirements
- PHP 8.1+
- Composer 2.0+
- MySQL 8.0+

### Installation
```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Set database credentials in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=codedev
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate --seed

# Start server
php artisan serve
🗄 Database Schema
Key Tables:

users (role: admin/user)

courses (with thumbnail)

lessons (belongs to course)

quizzes (with questions)

certifications (PDF paths)

📡 API Routes
Authentication
POST   /api/register
POST   /api/login
POST   /api/logout
POST   /api/forgot-password
Admin Routes
GET    /api/admin/users
POST   /api/admin/courses
PUT    /api/admin/courses/{id}
DELETE /api/admin/users/{id}
Student Routes
GET    /api/courses
POST   /api/courses/enroll
GET    /api/lessons/{id}
POST   /api/quizzes/submit
🔐 Authentication
Uses Laravel Sanctum:

php
// Protect routes
Route::middleware('auth:sanctum')->group(function () {
    // Protected routes here
});

// Admin middleware
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Admin-only routes
});
📦 Packages
Package	Purpose
laravel/sanctum	API authentication
dompdf	Certificate generation
laravel-mail	Email notifications
🐛 Debugging
bash
# Clear caches
php artisan cache:clear
php artisan view:clear

# Generate API docs
php artisan l5-swagger:generate
