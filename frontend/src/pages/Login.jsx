import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/token', formData);
      const token = response.data.access_token;
      
      console.log('Received token:', token);
      
      if (!token) {
        throw new Error('Token not received');
      }

      localStorage.setItem('token', token);
      setToken(token);

      const savedToken = localStorage.getItem('token');
      console.log('Saved token:', savedToken);

      try {
        const testResponse = await axios.get('http://localhost:8000/test-auth', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Auth test response:', testResponse.data);
      } catch (error) {
        console.error('Auth test failed:', error);
      }

      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="text-center">Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary full-width">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 