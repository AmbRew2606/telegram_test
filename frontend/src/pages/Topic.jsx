import React, { useEffect, useState } from "react";
import Sidebar from '../components/Sidebar';
import axios from "axios"; //потом надо и другие страницы к нему прикрутить

const Topic = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  // список всех разделов для фильтра
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8081/api/sections")
      .then((res) => setSections(res.data))
      .catch((err) => console.error("Ошибка загрузки разделов", err));
  }, []);

  // загрузка темы при выборе раздела
  useEffect(() => {
    if (!selectedSection) return;

    setLoading(true);
    axios
      .get(`http://127.0.0.1:8081/api/topics?sectionId=${selectedSection}`)
      .then((res) => {
        // если API вернуло null, происходит замена на пустой массив
        setTopics(res.data || []);
      })
      .catch((err) => console.error("Ошибка загрузки тем", err))
      .finally(() => setLoading(false));
  }, [selectedSection]);

  return (
    <>
    <Sidebar />
    <main>
    <div style={{ padding: '32px 90px' }}>
        <div className="container">
        <h1>Темы</h1>

        <div style={{ marginBottom: "20px" }}>
            <h2>Выбери раздел: </h2>


            <select style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none'
            }}
            id="section-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            >
            <option value="">-- Выбери --</option>

            {sections.map((s) => (
                <option key={s.id} value={s.id}>
                {s.name}
                </option>
            ))}
            </select>
        </div>

        {loading && <p>Загрузка тем...</p>}

        {!loading && selectedSection && topics.length === 0 && (
            <p>В разделе нету тем!</p> 
        )}

        {/* <ul>
            {topics.map((topic) => (
            <li key={topic.id}>
                <strong>{topic.name}</strong> — {topic.questions} вопрос(ов)
            </li>
            ))}
        </ul> */}
        <div className="topic__conteiner">
        {topics.map((topic) => (
            <div key={topic.id} style={{
                background: '#fff',
                color: '#111',
                fontWeight: '500',
                maxWidth: '340px',
                height: '200px',
                padding: '2rem',
                boxSizing: 'border-box',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <span>{topic.name}</span>
                </div>
                <div>
                    <span>Вопросы: </span><span>{topic.questions}</span>
                </div>
                
                
                {/* <strong>{topic.name}</strong> — {topic.questions} вопрос(ов) */}
            </div>
            ))}
                      <div className="section__add">
            <div className="icon-hover">
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="100%" viewBox="0 0 35 35" fill="none">
                <line x1="17.7195" y1="6.8291" x2="17.7195" y2="28.1706" stroke="#AFAFAF" strokeWidth="3" />
                <line x1="6.82935" y1="17.2803" x2="28.1708" y2="17.2803" stroke="#AFAFAF" strokeWidth="3" />
                <circle cx="17.5" cy="17.5" r="17" stroke="#AFAFAF" />
              </svg>
            </div>
          </div>
        </div>




        </div>
        </div>
        </main>
    </>
  );
};

export default Topic;
