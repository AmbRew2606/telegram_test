import { Link } from 'react-router-dom';

function Header() {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#333', color: 'white' }}>
      <nav>
        <Link to="/" style={{ marginRight: '1rem', color: 'white' }}>Главная</Link>
        <Link to="/sections" style={{ color: 'white' }}>Разделы</Link>
      </nav>
    </header>
  );
}

export default Header;
