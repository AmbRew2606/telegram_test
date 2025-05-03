import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ikonAdd from '../assets/add.svg';
import '../components/Modal.scss';

function Sections() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  // const [newTopics, setNewTopics] = useState('');
  const [showModal, setShowModal] = useState(false);
  // const [activeSectionId, setActiveSectionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [newTopicsArray, setNewTopicsArray] = useState(['']);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const menuItemStyle = {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    userSelect: 'none'
  };
  
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

    setErrorMessage(''); // очистка ошибки 

 
    const filteredTopics = newTopicsArray.map(t => t.trim()).filter(Boolean);
    const sectionData = {
      name: newSectionName,
      topics: filteredTopics
    };

    fetch('http://localhost:8081/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData),
    })
      .then(res => res.json())
      .then(data => {
        setSections(prev => [...prev, data]);
        setNewSectionName('');
        setNewTopics(''); // очистка темы
        setShowModal(false);
      })
      .catch(err => console.error('Ошибка добавления:', err));
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  // const toggleSection = (id) => {
  //   setActiveSectionId(prev => (prev === id ? null : id));
  // };

  return (
    <>
      <Sidebar />
      <main>
        <div style={{ padding: '32px 90px' }}>
          <h1 style={{ padding: '32px 0' }}>Разделы</h1>

          {sections.map(section => (
            <div
              key={section.id}
              style={{
                marginBottom: '2rem',
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                background: '#fff',
                padding: '1rem',
                alignItems: 'center',
                borderRadius: '8px'
              }}>
    <div
      className="section__title"
      onClick={() => toggleSection(section.id)}
      style={{ cursor: 'pointer' }}
    >
      {section.name}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', opacity: '0.5' }}>Темы: {section.topics}</span>
        <span style={{ fontSize: '12px', opacity: '0.5' }}>Вопросы: {section.questions}</span>
      </div>
    </div>

    {/* Кнопка меню */}
    <div style={{ position: 'relative' }} className="menu-container">
  <div className="section__menu">
    <svg style={{ margin: 'auto' }} xmlns="http://www.w3.org/2000/svg" width="23" height="5" viewBox="0 0 23 5" fill="none">
      <circle cx="2.5" cy="2.5" r="2.5" fill="black" fillOpacity="0.4" />
      <circle cx="20.5" cy="2.5" r="2.5" fill="black" fillOpacity="0.4" />
      <circle cx="11.5" cy="2.5" r="2.5" fill="black" fillOpacity="0.4" />
    </svg>
  </div>

  <div className="section__dropdown">
    <div className="menu-item">Темы раздела</div>
    <div className="menu-item">Вопросы раздела</div>
    <div className="menu-item">Готовые тесты</div>
    <div className="menu-item">Переименовать</div>
    <div className="menu-item danger">Удалить</div>
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

      {/* модалка */}
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
                <h2>Темы</h2>
                {newTopicsArray.map((topic, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    gap: '0.5rem'
                  }}
                >
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      const updatedTopics = [...newTopicsArray];
                      updatedTopics[index] = e.target.value;
                      setNewTopicsArray(updatedTopics);
                    }}
                    placeholder={`Тема ${index + 1}`}
                    style={{
                      flexGrow: 1,
                      padding: '1rem',
                      borderRadius: '8px',
                      border: 'none',
                      height: '45px',
                      boxSizing: 'border-box',
                    }}
                  />

                 
                  <button
                    onClick={() => {
                      const updatedTopics = newTopicsArray.filter((_, i) => i !== index);
                      setNewTopicsArray(updatedTopics);
                    }}
                    style={{
                      background: '#E44242',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0 0.7rem',
                      cursor: 'pointer',
                      fontSize: '14px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <g clip-path="url(#clip0_455_13)">
                    <path d="M17.2136 3.07107L10.1426 10.1421M3.07151 17.2132L10.1426 10.1421M10.1426 10.1421L3.07151 3.07107L17.2136 17.2132" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_455_13">
                    <rect width="20" height="20" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>
                  </button>
              

                </div>
              ))}


                {/* кнопка для добавления темы */}
                <div onClick={() => setNewTopicsArray([...newTopicsArray, ''])} className="section__add">
                  <div className="icon-hover">
                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="100%" viewBox="0 0 35 35" fill="none">
                      <line x1="17.7195" y1="6.8291" x2="17.7195" y2="28.1706" stroke="#AFAFAF" strokeWidth="3" />
                      <line x1="6.82935" y1="17.2803" x2="28.1708" y2="17.2803" stroke="#AFAFAF" strokeWidth="3" />
                      <circle cx="17.5" cy="17.5" r="17" stroke="#AFAFAF" />
                    </svg>
                  </div>
                </div>

                {/* появление ошибки */}
                {/* {errorMessage && (
                  <p style={{
                    color: '#E44242',
                    fontSize: '14px',
                    marginTop: '5px',
                  }}>
                    {errorMessage}
                  </p>
                )} */}
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