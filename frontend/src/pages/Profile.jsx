import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

function Profile() {
  const [results, setResults] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserEmail(response.data.email);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };

    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/users/me/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Ошибка при получении результатов:', error);
      }
    };

    fetchUserData();
    fetchResults();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-info">
          <h2>Профиль</h2>
          <div className="user-email">{userEmail}</div>
          <Link to="/tests" className="nav-link">
            Перейти к тестам
          </Link>
        </div>

        <div className="profile-results">
          <h2>Результаты тестов</h2>
          <div className="results-list">
            {results.length > 0 ? (
              results.map((result) => (
                <div key={result.id} className="test-result">
                  <div className="result-header">
                    <span className="test-id">Тест ID: {result.test_id}</span>
                    <span className="score">Результат: {result.score}%</span>
                  </div>
                  <div className="result-date">
                    Дата: {new Date(result.completed_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                У вас пока нет пройденных тестов
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 