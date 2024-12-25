import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Tests from './pages/Tests';
import Header from './components/Header';
import Register from './pages/Register';
import TestTaking from './pages/TestTaking';
import CreateTest from './pages/CreateTest';
import './styles/main.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        <Header token={token} setToken={setToken} />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile setToken={setToken} />
              </PrivateRoute>
            } />
            <Route path="/tests" element={
              <PrivateRoute>
                <Tests />
              </PrivateRoute>
            } />
            <Route path="/tests/take/:testId" element={
              <PrivateRoute>
                <TestTaking />
              </PrivateRoute>
            } />
            <Route path="/tests/create" element={
              <PrivateRoute>
                <CreateTest />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
