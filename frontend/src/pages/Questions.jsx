import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Questions = () => {
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

  // получение всех разделов
  useEffect(() => {
    axios.get("http://127.0.0.1:8081/api/sections")
      .then((res) => setSections(res.data))
      .catch((err) => console.error("Ошибка загрузки разделов", err));
  }, []);

  // загрузка тем при выборе раздела
  useEffect(() => {
    if (!selectedSection) {
      setTopics([]);
      setSelectedTopic("");
      return;
    }

    axios.get(`http://127.0.0.1:8081/api/topics?sectionId=${selectedSection}`)
      .then((res) => setTopics(res.data))
      .catch((err) => console.error("Ошибка загрузки тем", err));
  }, [selectedSection]);

  // загрузка вопросов при выборе темы
  useEffect(() => {
    if (!selectedSection || !selectedTopic) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    axios.get(`http://127.0.0.1:8081/api/questions?sectionId=${selectedSection}&topicId=${selectedTopic}`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Ошибка загрузки вопросов", err))
      .finally(() => setLoading(false));
  }, [selectedTopic, selectedSection]);

  return (
    <>
      <Sidebar />
      <main>
        <div style={{ padding: "32px 90px" }}>
          <div className="container">
            <h1>Вопросы</h1>

            <div style={{ marginBottom: "16px" }}>
              <label>Раздел: </label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">-- Выбери раздел --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {topics.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <label>Тема: </label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                  <option value="">-- Выбери тему --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {loading && <p>Загрузка вопросов...</p>}

            {!loading && selectedSection && topics.length === 0 && (
                <p>В разделе нету тем и вопросов.</p>
            )}

            {!loading && selectedSection && topics.length > 0 && selectedTopic && questions.length === 0 && (
                <p>В этой теме пока нет вопросов.</p>
            )}

            <div>
            {questions.map((question) => (
                <div key={question.id} style={{ marginBottom: '24px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>{question.text}</h3>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    {question.answers.map((answer) => (
                    <li
                        key={answer.id}
                        style={{
                        backgroundColor: answer.is_correct ? '#d4edda' : '#f8f9fa',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        }}
                    >
                        {answer.text}
                    </li>
                    ))}
                </ul>
                </div>
            ))}
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default Questions;
