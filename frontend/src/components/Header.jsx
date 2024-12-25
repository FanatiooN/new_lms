import { Link, useNavigate } from 'react-router-dom';
import '../styles/main.css';

function Header({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (token) {
      navigate('/tests');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" onClick={handleLogoClick} className="logo">
          LMS System
        </a>
        <nav className="nav">
          {token ? (
            <>
              <Link to="/tests" className="nav-button">
                Тесты
              </Link>
              <Link to="/profile" className="nav-button">
                Профиль
              </Link>
              <button onClick={handleLogout} className="nav-button logout">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">
                Войти
              </Link>
              <Link to="/register" className="nav-button primary">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 