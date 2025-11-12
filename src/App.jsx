import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReviewList from './components/ReviewList';
import ReviewDetail from './components/ReviewDetail';
import ReviewForm from './components/ReviewForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ReviewList />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/create" element={<ReviewForm />} />
          <Route path="/edit/:id" element={<ReviewForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
