import { useEffect, useState } from 'react'
import Header from '../components/Header'; // хедер

function Sections() {
  const [sections, setSections] = useState([])

  useEffect(() => {
    fetch('http://localhost:8081/api/sections')
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error('Ошибка загрузки:', err))
  }, [])

  return (
    <>
      <Header /> 
    <div style={{ padding: '2rem' }}>
      <h1>Разделы и темы</h1>
      {sections.map(section => (
        <div key={section.id} style={{ marginBottom: '2rem' }}>
          <h2>{section.name}</h2>
          <ul>
            {section.topics.map(topic => (
              <li key={topic.id}>{topic.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    </>
  )
}

export default Sections
