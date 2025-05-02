import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ikonAdd from '../assets/add.svg';
import '../components/Modal.scss';

function Sections() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); 

  useEffect(() => {
    fetch('http://localhost:8081/api/sections/test')
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error('Ошибка загрузки:', err));
  }, []);

  const handleAddSection = () => {
    //проверка на пустой текст
    if (!newSectionName.trim()) {
      setErrorMessage("Должен быть текст!");
      return;
    }

    //проверка на дубль названия
    const isDuplicate = sections.some(section => section.name.toLowerCase() === newSectionName.toLowerCase());
    if (isDuplicate) {
      setErrorMessage("Раздел с таким названием уже существует!");
      return;
    }

    setErrorMessage(''); 

    fetch('http://localhost:8081/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSectionName }),
    })
      .then(res => res.json())
      .then(data => {
        setSections(prev => [...prev, data]);
        setNewSectionName('');
        setShowModal(false);
      })
      .catch(err => console.error('Ошибка добавления:', err));
  };

  const toggleSection = (id) => {
    setActiveSectionId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <Sidebar />
      <main>
        <div style={{ padding: '32px 90px' }}>
          <h1 style={{ padding: '32px 0' }}>Разделы</h1>

          {sections.map(section => (
            <div key={section.id} style={{ marginBottom: '2rem', position: 'relative' }}>
              <div className="section__title" onClick={() => toggleSection(section.id)}>
                {section.name}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', opacity: '0.5' }}>Темы: {section.topics}</span>
                  <span style={{ fontSize: '12px', opacity: '0.5' }}>Вопросы: {section.questions}</span>
                </div>
                <div className={`section__panel ${activeSectionId === section.id ? 'active' : ''}`}>
                  <div className='section__btn'>
                    <span>Темы</span>
                  </div>
                  <div className='section__btn'>
                    <span>Вопросы</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div onClick={() => setShowModal(true)} className="section__add">
            <div className="icon-hover">
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="100%" viewBox="0 0 35 35" fill="none">
                <line x1="17.7195" y1="6.8291" x2="17.7195" y2="28.1706" stroke="#AFAFAF" strokeWidth="3" />
                <line x1="6.82935" y1="17.2803" x2="28.1708" y2="17.2803" stroke="#AFAFAF" strokeWidth="3" />
                <circle cx="17.5" cy="17.5" r="17" stroke="#AFAFAF" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Модалка */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="modal__block">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className="logo">
                QuizFlow
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}>
              <div>
                <h2>Раздел</h2>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Название нового раздела"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    height: '45px',
                    boxSizing: 'border-box',
                  }}
                />
                {/* появление ошибки */}
                {errorMessage && (
                  <p style={{
                    color: '#E44242',
                    fontSize: '14px',
                    marginTop: '5px',
                  }}>
                    {errorMessage}
                  </p>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div onClick={handleAddSection} style={{
                  cursor: 'pointer',
                  background: '#ffffff',
                  color: '#111111',
                  padding: '10px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>Добавить</span>
                </div>
                <div onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }}>
                  <span className='modal__cencel'>Отмена</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Sections;