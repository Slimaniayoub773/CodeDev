<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course;

class QuizzesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the React course
        $reactCourse = Course::where('title', 'like', '%React%')->first();

        if (!$reactCourse) {
            $this->call(CoursesSeeder::class);
            $reactCourse = Course::where('title', 'like', '%React%')->first();
        }

        $reactQuizzes = [
            // Quiz 1: Introduction to React
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is React primarily used for?',
                'option_1' => 'Server-side programming',
                'option_2' => 'Building user interfaces',
                'option_3' => 'Database management',
                'option_4' => 'Mobile app development without JavaScript',
                'correct_answer' => 'Building user interfaces',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 2: Setting Up React Environment
            [
                'course_id' => $reactCourse->id,
                'question' => 'What command creates a new React application?',
                'option_1' => 'npm init react-app',
                'option_2' => 'npm create-react-app',
                'option_3' => 'npx create-react-app',
                'option_4' => 'react new app',
                'correct_answer' => 'npx create-react-app',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 3: JSX Syntax
            [
                'course_id' => $reactCourse->id,
                'question' => 'What does JSX stand for?',
                'option_1' => 'JavaScript XML',
                'option_2' => 'JavaScript Extension',
                'option_3' => 'JavaScript Syntax',
                'option_4' => 'JavaScript Execute',
                'correct_answer' => 'JavaScript XML',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 4: Components and Props
            [
                'course_id' => $reactCourse->id,
                'question' => 'How do you pass data to a child component in React?',
                'option_1' => 'Using state',
                'option_2' => 'Using props',
                'option_3' => 'Using refs',
                'option_4' => 'Using context',
                'correct_answer' => 'Using props',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 5: State and Lifecycle
            [
                'course_id' => $reactCourse->id,
                'question' => 'Where should you initialize state in a class component?',
                'option_1' => 'In the render method',
                'option_2' => 'In the constructor',
                'option_3' => 'In componentDidMount',
                'option_4' => 'In any lifecycle method',
                'correct_answer' => 'In the constructor',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 6: Handling Events
            [
                'course_id' => $reactCourse->id,
                'question' => 'How do you prevent default behavior in React event handlers?',
                'option_1' => 'event.stopDefault()',
                'option_2' => 'event.preventDefault()',
                'option_3' => 'event.stopPropagation()',
                'option_4' => 'return false',
                'correct_answer' => 'event.preventDefault()',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 7: Conditional Rendering
            [
                'course_id' => $reactCourse->id,
                'question' => 'Which is NOT a way to do conditional rendering in React?',
                'option_1' => 'if/else statements',
                'option_2' => 'ternary operator',
                'option_3' => 'logical && operator',
                'option_4' => 'for loop',
                'correct_answer' => 'for loop',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 8: Lists and Keys
            [
                'course_id' => $reactCourse->id,
                'question' => 'Why are keys important when rendering lists in React?',
                'option_1' => 'They help React identify which items have changed',
                'option_2' => 'They make the list items clickable',
                'option_3' => 'They improve performance for small lists',
                'option_4' => 'They are required for list styling',
                'correct_answer' => 'They help React identify which items have changed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 9: Forms and Controlled Components
            [
                'course_id' => $reactCourse->id,
                'question' => 'In a controlled component, form data is handled by:',
                'option_1' => 'The DOM',
                'option_2' => 'The component state',
                'option_3' => 'The browser',
                'option_4' => 'A separate form handler',
                'correct_answer' => 'The component state',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 10: Lifting State Up
            [
                'course_id' => $reactCourse->id,
                'question' => 'Where should shared state be placed in a React application?',
                'option_1' => 'In the deepest component that needs it',
                'option_2' => 'In the closest common ancestor of components that need it',
                'option_3' => 'In a global variable',
                'option_4' => 'In the root component',
                'correct_answer' => 'In the closest common ancestor of components that need it',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 11: Composition vs Inheritance
            [
                'course_id' => $reactCourse->id,
                'question' => 'What does React recommend for code reuse?',
                'option_1' => 'Inheritance',
                'option_2' => 'Composition',
                'option_3' => 'Mixins',
                'option_4' => 'Global functions',   
                'correct_answer' => 'Composition',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 12: React Hooks Introduction
            [
                'course_id' => $reactCourse->id,
                'question' => 'What does the useState hook return?',
                'option_1' => 'The current state and a function to update it',
                'option_2' => 'Just the current state',
                'option_3' => 'Just a function to update the state',
                'option_4' => 'A promise that resolves to the state',
                'correct_answer' => 'The current state and a function to update it',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 13: useEffect Hook
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is the purpose of the useEffect hook?',
                'option_1' => 'To handle user events',
                'option_2' => 'To perform side effects in function components',
                'option_3' => 'To create memoized values',
                'option_4' => 'To manage component state',
                'correct_answer' => 'To perform side effects in function components',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 14: Custom Hooks
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is the main benefit of custom hooks?',
                'option_1' => 'They replace class components',
                'option_2' => 'They allow stateful logic to be reused',
                'option_3' => 'They improve performance',
                'option_4' => 'They simplify JSX syntax',
                'correct_answer' => 'They allow stateful logic to be reused',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 15: Context API
            [
                'course_id' => $reactCourse->id,
                'question' => 'When should you use Context API?',
                'option_1' => 'For state that needs to be accessed by many components at different nesting levels',
                'option_2' => 'For all component state',
                'option_3' => 'Only for global application settings',
                'option_4' => 'As a replacement for props',
                'correct_answer' => 'For state that needs to be accessed by many components at different nesting levels',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 16: React Router
            [
                'course_id' => $reactCourse->id,
                'question' => 'What component is used to define a route in React Router?',
                'option_1' => '<Router>',
                'option_2' => '<Route>',
                'option_3' => '<Link>',
                'option_4' => '<Switch>',
                'correct_answer' => '<Route>',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 17: Redux Fundamentals
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is the correct order of Redux data flow?',
                'option_1' => 'Action -> Reducer -> Store -> View',
                'option_2' => 'View -> Action -> Reducer -> Store',
                'option_3' => 'View -> Action -> Store -> Reducer',
                'option_4' => 'Action -> Store -> Reducer -> View',
                'correct_answer' => 'Action -> Reducer -> Store -> View',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 18: React with Redux
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is the purpose of mapStateToProps?',
                'option_1' => 'To define which actions a component can dispatch',
                'option_2' => 'To select which parts of the Redux store a component needs',
                'option_3' => 'To map component state to props',
                'option_4' => 'To connect a component to the store',
                'correct_answer' => 'To select which parts of the Redux store a component needs',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 19: Performance Optimization
            [
                'course_id' => $reactCourse->id,
                'question' => 'What is the purpose of React.memo?',
                'option_1' => 'To memoize expensive calculations',
                'option_2' => 'To prevent unnecessary re-renders of functional components',
                'option_3' => 'To cache API responses',
                'option_4' => 'To optimize Redux selectors',
                'correct_answer' => 'To prevent unnecessary re-renders of functional components',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Quiz 20: Testing React Components
            [
                'course_id' => $reactCourse->id,
                'question' => 'What library is commonly used with Jest for testing React components?',
                'option_1' => 'React Testing Library',
                'option_2' => 'Enzyme',
                'option_3' => 'Mocha',
                'option_4' => 'Chai',
                'correct_answer' => 'React Testing Library',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert React quizzes
        DB::table('quizzes')->insert($reactQuizzes);
    }
}