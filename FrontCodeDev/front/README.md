Frontend README.md**

```markdown
# CodeDev Frontend

![React Interface](https://via.placeholder.com/800x400?text=React+Interface)

React-based interface for the CodeDev learning platform.

## 🏁 Getting Started

### Prerequisites
- Node.js v16+
- npm v8+

### Installation
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
REACT_APP_API_URL=http://localhost:8000/api

# Start development server
npm start
🧩 Component Structure
src/
├── Admin/
│   ├── Dashboard/      # Admin analytics
│   ├── Users/         # User management
│   └── Courses/       # Course CRUD
├── User/
│   ├── Course/        # Course viewing
│   └── Profile/       # User profile
├── components/        # Reusable components
│   ├── Auth/
│   └── UI/
├── services/          # API services
│   ├── api.js         # Axios instance
│   └── auth.js        # Auth functions
└── styles/            # CSS files
🛠 Development
bash
# Run in development mode
npm start

# Build for production
npm run build

# Run tests
npm test

# Fix linting issues
npm run lint
🌐 API Connection
Configure in services/api.js:

javascript
export const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
📦 Dependencies
Package	Use Case
react-router	Navigation
axios	HTTP requests
recharts	Data visualization
react-hook-form	Form handling
🚨 Common Issues
CORS Errors:

Ensure backend has proper CORS headers

Verify REACT_APP_API_URL matches backend URL

Authentication Failures:

Check token storage in localStorage

Verify Sanctum config in backend