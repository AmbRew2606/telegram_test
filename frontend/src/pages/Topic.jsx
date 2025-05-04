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
            <label htmlFor="section-select">Выбери раздел: </label>
            <select
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

        <ul>
            {topics.map((topic) => (
            <li key={topic.id}>
                <strong>{topic.name}</strong> — {topic.questions} вопрос(ов)
            </li>
            ))}
        </ul>
        </div>
        </div>
        </main>
    </>
  );
};

export default Topic;
