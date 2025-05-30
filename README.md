# CodeDev - Programming Learning Platform

![CodeDev Logo](https://via.placeholder.com/150x50?text=CodeDev+Logo)

A full-stack e-learning platform for programming courses with admin and student interfaces.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/CodeDev.git 
cd CodeDev

# Set up backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# In new terminal - set up frontend
cd ../frontend
cp .env.example .env
npm install
npm start
🌟 Features
Admin Panel
📊 Dashboard with analytics

👥 User management (CRUD + blocking)

📚 Course/Lesson/Quiz/Enrollment management

📜 Certificate generation

✉️ Email response system

Student Portal
🏠 Course catalog with search

📝 Lesson progression system

� Quizzes with certification

👤 Profile management

📧 Contact form

🛠 Tech Stack
Area	Technologies
Frontend	React, React Router, Axios, Recharts
Backend	Laravel, MySQL, Sanctum Auth
Common	Git, REST API, JWT Authentication
📂 Project Structure
CodeDev/
├── frontend/       # React application (PORT: 3000)
│   ├── public/     # Static files
│   └── src/        # React components
├── backend/        # Laravel API (PORT: 8000)
│   ├── app/        # MVC structure
│   └── database/   # Migrations & seeds
🔗 Links
Frontend Documentation

Backend Documentation

API Endpoints

📜 License
MIT © 2023 CodeDev