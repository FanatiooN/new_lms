import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

function TestTaking() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);

  const numericTestId = parseInt(testId, 10);
  console.log('TestTaking component - testId:', testId, 'numeric:', numericTestId);

  useEffect(() => {
    if (isNaN(numericTestId)) {
      setError('Некорректный ID теста');
      return;
    }

    const fetchTestInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching test info for ID:', numericTestId);
        const response = await axios.get(
          `http://localhost:8000/tests/${numericTestId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Test info response:', response.data);
        setTestInfo(response.data);
      } catch (error) {
        console.error('Error fetching test info:', error);
        setError('Ошибка при загрузке информации о тесте');
      }
    };

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8000/tests/${numericTestId}/questions`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setQuestions(response.data);
        } else {
          setError('Неверный формат данных вопросов');
        }
      } catch (error) {
        setError('Ошибка при загрузке вопросов');
      } finally {
        setLoading(false);
      }
    };

    fetchTestInfo();
    fetchQuestions();
  }, [numericTestId]);

  const handleAnswer = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/tests/${numericTestId}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate('/profile');
    } catch (error) {
      setError('Ошибка при отправке ответов');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="test-taking-container">
          <div className="loading-message">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="test-taking-container">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate('/tests')}>
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container">
        <div className="test-taking-container">
          <div className="message">В этом тесте пока нет вопросов</div>
          <button className="btn btn-primary" onClick={() => navigate('/tests')}>
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="container">
      <div className="test-taking-container">
        {testInfo && (
          <div className="test-info">
            <h2>{testInfo.title}</h2>
            <p>{testInfo.description}</p>
          </div>
        )}

        <div className="question-progress">
          Вопрос {currentQuestion + 1} из {questions.length}
        </div>

        <div className="question-card">
          <h3>{question.question_text}</h3>
          <div className="options-list">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  answers[question.id] === index ? 'selected' : ''
                }`}
                onClick={() => handleAnswer(question.id, index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          {currentQuestion > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentQuestion(curr => curr - 1)}
            >
              Назад
            </button>
          )}
          {currentQuestion < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQuestion(curr => curr + 1)}
            >
              Далее
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Завершить тест
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestTaking; 