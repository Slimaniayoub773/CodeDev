import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // We'll create this next

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Knowledge Not Found</h2>
        <p className="not-found-message">
          The code path you're following doesn't compile.<br />
          Let's debug this together and get you back to learning.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="not-found-button primary">
            Return to Homepage
          </Link>
          <Link to="/courses" className="not-found-button secondary">
            Browse All Courses
          </Link>
        </div>
        
        <div className="not-found-code">
          <pre>
            {`// While you're here, try this:\n`}
            {`const solution = {\n`}
            {`  problem: "404 error",\n`}
            {`  fix: "Navigate to working routes",\n`}
            {`  action: () => window.location.href = "/"\n`}
            {`};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NotFound;