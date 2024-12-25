import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_answer: 0 }
  ]);
  const [error, setError] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: '', options: ['', '', '', ''], correct_answer: 0 }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!title.trim() || !description.trim()) {
      setError('Заполните название и описание теста');
      return;
    }

    for (const question of questions) {
      if (!question.question_text.trim()) {
        setError('Заполните текст всех вопросов');
        return;
      }
      if (question.options.some(opt => !opt.trim())) {
        setError('Заполните все варианты ответов');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Необходима авторизация');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/tests/',
        {
          title,
          description,
          questions: questions.map(q => ({
            ...q,
            options: q.options.map(opt => opt.trim())
          }))
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,  // Убедимся, что токен отправляется правильно
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        navigate('/tests');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      if (error.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(
          error.response?.data?.detail || 
          'Ошибка при создании теста. Пожалуйста, проверьте введенные данные.'
        );
      }
    }
  };

  return (
    <div className="container create-test-page">
      <div className="create-test-container">
        <h2>Создание теста</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название теста</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Описание теста</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="questions-section">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="question-form-card">
                <div className="question-header">
                  <h3>Вопрос {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Текст вопроса</label>
                  <input
                    type="text"
                    className="form-input"
                    value={question.question_text}
                    onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    required
                  />
                </div>

                <div className="options-form-group">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-input-group">
                      <input
                        type="text"
                        className="form-input"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Вариант ${oIndex + 1}`}
                        required
                      />
                      <input
                        type="radio"
                        name={`correct_${qIndex}`}
                        checked={question.correct_answer === oIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correct_answer', oIndex)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="create-test-buttons">
            <button
              type="button"
              className="btn btn-add-question"
              onClick={addQuestion}
            >
              Добавить вопрос
            </button>

            <button type="submit" className="btn btn-primary btn-create-test">
              Создать тест
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTest; 