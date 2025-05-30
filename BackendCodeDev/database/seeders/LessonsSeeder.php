<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course;

class LessonsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the React and Laravel courses
        $reactCourse = Course::where('title', 'like', '%React%')->first();
        $laravelCourse = Course::where('title', 'like', '%Laravel%')->first();

        if (!$reactCourse || !$laravelCourse) {
            $this->call(CoursesSeeder::class);
            $reactCourse = Course::where('title', 'like', '%React%')->first();
            $laravelCourse = Course::where('title', 'like', '%Laravel%')->first();
        }

        $reactLessons = [
            [
                'title' => 'Introduction to React',
                'explain' => 'Learn what React is, its core concepts, and why it\'s so popular for building user interfaces.',
                'code_chunk' => "import React from 'react';\n\nfunction App() {\n  return <h1>Hello, React!</h1>;\n}\n\nexport default App;",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Setting Up Your React Environment',
                'explain' => 'Learn how to set up a React development environment using Create React App and understand the project structure.',
                'code_chunk' => "npx create-react-app my-app\ncd my-app\nnpm start",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'JSX Syntax',
                'explain' => 'Understand JSX, the syntax extension for JavaScript that React uses to describe what the UI should look like.',
                'code_chunk' => "const element = <h1 className=\"greeting\">Hello, world!</h1>;\n\n// This is equivalent to:\nconst element = React.createElement(\n  'h1',\n  {className: 'greeting'},\n  'Hello, world!'\n);",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Components and Props',
                'explain' => 'Learn how to create and use components, and how to pass data between them using props.',
                'code_chunk' => "function Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n\nfunction App() {\n  return <Welcome name=\"Sara\" />;\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'State and Lifecycle',
                'explain' => 'Understand component state and lifecycle methods in class components.',
                'code_chunk' => "class Clock extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = {date: new Date()};\n  }\n\n  componentDidMount() {\n    this.timerID = setInterval(\n      () => this.tick(),\n      1000\n    );\n  }\n\n  componentWillUnmount() {\n    clearInterval(this.timerID);\n  }\n\n  tick() {\n    this.setState({\n      date: new Date()\n    });\n  }\n\n  render() {\n    return <div>{this.state.date.toLocaleTimeString()}</div>;\n  }\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Handling Events',
                'explain' => 'Learn how to handle events in React components.',
                'code_chunk' => "function ActionLink() {\n  function handleClick(e) {\n    e.preventDefault();\n    console.log('The link was clicked.');\n  }\n\n  return (\n    <a href=\"#\" onClick={handleClick}>\n      Click me\n    </a>\n  );\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Conditional Rendering',
                'explain' => 'Learn different techniques for conditional rendering in React.',
                'code_chunk' => "function Greeting(props) {\n  const isLoggedIn = props.isLoggedIn;\n  if (isLoggedIn) {\n    return <UserGreeting />;\n  }\n  return <GuestGreeting />;\n}\n\n// Using ternary operator\n{isLoggedIn ? <LogoutButton /> : <LoginButton />}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Lists and Keys',
                'explain' => 'Learn how to render lists of elements and the importance of keys.',
                'code_chunk' => "function NumberList(props) {\n  const numbers = props.numbers;\n  const listItems = numbers.map((number) =>\n    <li key={number.toString()}>\n      {number}\n    </li>\n  );\n  return <ul>{listItems}</ul>;\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Forms and Controlled Components',
                'explain' => 'Learn how to work with forms in React using controlled components.',
                'code_chunk' => "class NameForm extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = {value: ''};\n  }\n\n  handleChange = (event) => {\n    this.setState({value: event.target.value});\n  }\n\n  handleSubmit = (event) => {\n    alert('A name was submitted: ' + this.state.value);\n    event.preventDefault();\n  }\n\n  render() {\n    return (\n      <form onSubmit={this.handleSubmit}>\n        <label>\n          Name:\n          <input type=\"text\" value={this.state.value} onChange={this.handleChange} />\n        </label>\n        <input type=\"submit\" value=\"Submit\" />\n      </form>\n    );\n  }\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Lifting State Up',
                'explain' => 'Learn how to share state between components by lifting it up to their closest common ancestor.',
                'code_chunk' => "class Calculator extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = {temperature: ''};\n  }\n\n  handleChange = (e) => {\n    this.setState({temperature: e.target.value});\n  }\n\n  render() {\n    const temperature = this.state.temperature;\n    return (\n      <div>\n        <TemperatureInput\n          temperature={temperature}\n          onTemperatureChange={this.handleChange} />\n        <BoilingVerdict\n          celsius={parseFloat(temperature)} />\n      </div>\n    );\n  }\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Composition vs Inheritance',
                'explain' => 'Understand how React favors composition over inheritance for code reuse.',
                'code_chunk' => "function FancyBorder(props) {\n  return (\n    <div className={'FancyBorder FancyBorder-' + props.color}>\n      {props.children}\n    </div>\n  );\n}\n\nfunction WelcomeDialog() {\n  return (\n    <FancyBorder color=\"blue\">\n      <h1 className=\"Dialog-title\">\n        Welcome\n      </h1>\n      <p className=\"Dialog-message\">\n        Thank you for visiting our spacecraft!\n      </p>\n    </FancyBorder>\n  );\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'React Hooks Introduction',
                'explain' => 'Learn about React Hooks and how they let you use state and other React features without writing classes.',
                'code_chunk' => "import React, { useState } from 'react';\n\nfunction Example() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'useEffect Hook',
                'explain' => 'Learn how to perform side effects in function components using the useEffect Hook.',
                'code_chunk' => "import React, { useState, useEffect } from 'react';\n\nfunction FriendStatus(props) {\n  const [isOnline, setIsOnline] = useState(null);\n\n  useEffect(() => {\n    function handleStatusChange(status) {\n      setIsOnline(status.isOnline);\n    }\n    \n    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);\n    return () => {\n      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);\n    };\n  });\n\n  if (isOnline === null) {\n    return 'Loading...';\n  }\n  return isOnline ? 'Online' : 'Offline';\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Custom Hooks',
                'explain' => 'Learn how to create your own Hooks to reuse stateful logic between components.',
                'code_chunk' => "import { useState, useEffect } from 'react';\n\nfunction useFriendStatus(friendID) {\n  const [isOnline, setIsOnline] = useState(null);\n\n  useEffect(() => {\n    function handleStatusChange(status) {\n      setIsOnline(status.isOnline);\n    }\n\n    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);\n    return () => {\n      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);\n    };\n  });\n\n  return isOnline;\n}\n\n// Using the custom Hook\nfunction FriendStatus(props) {\n  const isOnline = useFriendStatus(props.friend.id);\n\n  if (isOnline === null) {\n    return 'Loading...';\n  }\n  return isOnline ? 'Online' : 'Offline';\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Context API',
                'explain' => 'Learn how to use Context to share values between components without explicitly passing props.',
                'code_chunk' => "const ThemeContext = React.createContext('light');\n\nfunction App() {\n  return (\n    <ThemeContext.Provider value=\"dark\">\n      <Toolbar />\n    </ThemeContext.Provider>\n  );\n}\n\nfunction Toolbar() {\n  return (\n    <div>\n      <ThemedButton />\n    </div>\n  );\n}\n\nfunction ThemedButton() {\n  const theme = useContext(ThemeContext);\n  return <button className={theme}>I am styled by theme context!</button>;\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'React Router',
                'explain' => 'Learn how to implement routing in React applications using React Router.',
                'code_chunk' => "import { BrowserRouter as Router, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <Router>\n      <div>\n        <nav>\n          <ul>\n            <li>\n              <Link to=\"/\">Home</Link>\n            </li>\n            <li>\n              <Link to=\"/about\">About</Link>\n            </li>\n          </ul>\n        </nav>\n\n        <Route path=\"/\" exact component={Home} />\n        <Route path=\"/about\" component={About} />\n      </div>\n    </Router>\n  );\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Redux Fundamentals',
                'explain' => 'Learn the core concepts of Redux for state management in React applications.',
                'code_chunk' => "import { createStore } from 'redux';\n\nfunction counter(state = 0, action) {\n  switch (action.type) {\n    case 'INCREMENT':\n      return state + 1;\n    case 'DECREMENT':\n      return state - 1;\n    default:\n      return state;\n  }\n}\n\nlet store = createStore(counter);\n\nstore.subscribe(() => console.log(store.getState()));\n\nstore.dispatch({ type: 'INCREMENT' });\nstore.dispatch({ type: 'INCREMENT' });\nstore.dispatch({ type: 'DECREMENT' });",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'React with Redux',
                'explain' => 'Learn how to connect React components to a Redux store.',
                'code_chunk' => "import { connect } from 'react-redux';\n\nconst Counter = ({ count, increment, decrement }) => (\n  <div>\n    <button onClick={decrement}>-</button>\n    <span>{count}</span>\n    <button onClick={increment}>+</button>\n  </div>\n);\n\nconst mapStateToProps = state => ({\n  count: state.count\n});\n\nconst mapDispatchToProps = dispatch => ({\n  increment: () => dispatch({ type: 'INCREMENT' }),\n  decrement: () => dispatch({ type: 'DECREMENT' })\n});\n\nexport default connect(\n  mapStateToProps,\n  mapDispatchToProps\n)(Counter);",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Performance Optimization',
                'explain' => 'Learn techniques to optimize React application performance.',
                'code_chunk' => "import React, { useMemo, useCallback } from 'react';\n\nfunction MyComponent({ list }) {\n  const sortedList = useMemo(() => {\n    return list.sort((a, b) => a.value - b.value);\n  }, [list]);\n\n  const handleClick = useCallback((item) => {\n    console.log('Item clicked:', item);\n  }, []);\n\n  return (\n    <ul>\n      {sortedList.map(item => (\n        <li key={item.id} onClick={() => handleClick(item)}>\n          {item.name}\n        </li>\n      ))}\n    </ul>\n  );\n}",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Testing React Components',
                'explain' => 'Learn how to test React components using Jest and React Testing Library.',
                'code_chunk' => "import { render, screen, fireEvent } from '@testing-library/react';\nimport Button from './Button';\n\ntest('renders button with text', () => {\n  render(<Button>Click me</Button>);\n  const buttonElement = screen.getByText(/click me/i);\n  expect(buttonElement).toBeInTheDocument();\n});\n\ntest('calls onClick prop when clicked', () => {\n  const handleClick = jest.fn();\n  render(<Button onClick={handleClick}>Click me</Button>);\n  fireEvent.click(screen.getByText(/click me/i));\n  expect(handleClick).toHaveBeenCalledTimes(1);\n});",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $laravelLessons = [
            [
                'title' => 'Introduction to Laravel',
                'explain' => 'Learn what Laravel is, its features, and the MVC architecture it follows.',
                'code_chunk' => "// Basic route in routes/web.php\nRoute::get('/', function () {\n    return view('welcome');\n});",
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Insert React lessons
        foreach ($reactLessons as $lesson) {
            $lesson['course_id'] = $reactCourse->id;
            DB::table('lessons')->insert($lesson);
        }

        // Insert Laravel lessons
        foreach ($laravelLessons as $lesson) {
            $lesson['course_id'] = $laravelCourse->id;
            DB::table('lessons')->insert($lesson);
        }
    }
}