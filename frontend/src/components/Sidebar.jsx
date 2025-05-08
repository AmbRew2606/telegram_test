import { Link } from 'react-router-dom';
import footLogo from '../assets/foot_logo.webp';
import './Sidebar.scss';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div style={{ gap: '30px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="logo">
          QuizFlow
          </div>
        </div>
        <nav className="sidebar__nav">
            <Link to="/" className="sidebar__link">Главная</Link>
            <Link to="/sections" className="sidebar__link">Разделы</Link>
            <Link to="/topics" className="sidebar__link">Темы</Link>
            <Link to="/questions" className="sidebar__link">Вопросы</Link>
            <Link to="/sections" className="sidebar__link">Настройки</Link>
        </nav>
      </div>
      <div className="foot_logo">
        <div className="foot_text">
          <span>by who?</span>
        </div>
        <div className="">
        <img src={footLogo} alt="Foot logo" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
