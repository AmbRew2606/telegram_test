import { useNavigate } from 'react-router-dom'
import Header from './components/Header'; // хедер
import './App.css'

function App() {
  const navigate = useNavigate()

  return (
    <>
      <Header /> 
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Главная страница</h1>
      <button
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/sections')}
      >
        Посмотреть все разделы и темы
      </button>
    </div>
    </>
  )
}

export default App


// import { useEffect, useState } from 'react'
// import './App.css'

// function App() {
//   const [sections, setSections] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     fetch('http://localhost:8081/api/sections')
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Ошибка загрузки данных')
//         }
//         return response.json()
//       })
//       .then((data) => {
//         setSections(data)
//         setLoading(false)
//       })
//       .catch((err) => {
//         setError(err.message)
//         setLoading(false)
//       })
//   }, [])

//   if (loading) return <p>Загрузка...</p>
//   if (error) return <p>Ошибка: {error}</p>

//   return (
//     <div>
//       <h1>Разделы и темы</h1>
//       {sections.map((section) => (
//         <div key={section.id} style={{ marginBottom: '20px' }}>
//           <h2>{section.name}</h2>
//           <ul>
//             {section.topics.map((topic) => (
//               <li key={topic.id}>{topic.name}</li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default App





















// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
