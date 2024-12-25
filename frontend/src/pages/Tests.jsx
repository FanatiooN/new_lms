import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

function Tests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/tests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Received tests:', response.data);
      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Ошибка формата данных');
      }
    } catch (error) {
      console.error('Ошибка при получении тестов:', error);
      setError('Ошибка при загрузке тестов');
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartTest = (testId) => {
    console.log('Starting test with ID:', testId, 'type:', typeof testId);
    // Преобразуем testId в число, если это строка
    const numericTestId = typeof testId === 'string' ? parseInt(testId, 10) : testId;
    
    if (numericTestId && !isNaN(numericTestId)) {
      navigate(`/tests/take/${numericTestId}`);
    } else {
      console.error('Invalid test ID:', testId);
      setError('Ошибка: некорректный ID теста');
    }
  };

  const handleDeleteAllTests = async () => {
    if (window.confirm('Вы уверены, что хотите удалить все тесты? Это действие нельзя отменить.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:8000/tests/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTests();
      } catch (error) {
        console.error('Ошибка при удалении тестов:', error);
        setError('Ошибка при удалении тестов');
      }
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h2>Доступные тесты</h2>
        <div className="header-buttons">
          <button
            onClick={handleDeleteAllTests}
            className="btn btn-danger"
            style={{ marginRight: '1rem' }}
          >
            Удалить все тесты
          </button>
          <Link to="/tests/create" className="btn btn-primary">
            Создать тест
          </Link>
        </div>
      </div>

      <div className="tests-grid">
        {tests.map((test) => {
          console.log('Rendering test:', test);
          return (
            <div key={test.id} className="card">
              <div>
                <h3>{test.title}</h3>
                <p>{test.description}</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  console.log('Запуск теста с ID:', test.id);
                  handleStartTest(test.id);
                }}
              >
                Начать тест
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tests; 