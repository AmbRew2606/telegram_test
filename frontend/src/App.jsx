import { useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'; // хедер
// import './App.css'

import './styles/main.scss' //стили

function App() {
  const navigate = useNavigate()

  return (
    <>
      <Sidebar /> 
    <main>
      <div style={{ padding: '32px 90px'}}>
        <h1>Я ХОЧУ ПИЦЦЫ</h1>
        {/* <button
          style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/sections')}
        >
          Посмотреть все разделы и темы
        </button> */}
      </div>
    </main>
    </>
  )
}

export default App