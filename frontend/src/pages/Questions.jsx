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

  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([{ text: "", is_correct: false }]);

  // получение всех разделов
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8081/api/sections")
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

    axios
      .get(`http://127.0.0.1:8081/api/topics?sectionId=${selectedSection}`)
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
    axios
      .get(
        `http://127.0.0.1:8081/api/questions?sectionId=${selectedSection}&topicId=${selectedTopic}`
      )
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Ошибка загрузки вопросов", err))
      .finally(() => setLoading(false));
  }, [selectedTopic, selectedSection]);

  const handleSubmit = () => {
    if (!questionText || answers.length < 2) {
      alert("Введите текст вопроса и минимум 2 варианта ответа.");
      return;
    }

    axios
      .post("http://127.0.0.1:8081/api/questions", {
        section_id: Number(selectedSection),
        topic_id: Number(selectedTopic),
        text: questionText,
        answers,
      })
      .then(() => {
        alert("Вопрос добавлен!");
        setQuestionText("");
        setAnswers([{ text: "", is_correct: false }]);
        return axios.get(
          `http://127.0.0.1:8081/api/questions?sectionId=${selectedSection}&topicId=${selectedTopic}`
        );
      })
      .then((res) => setQuestions(res.data))
      .catch((err) => {
        console.error("Ошибка при добавлении вопроса", err);
        alert("Ошибка при добавлении вопроса.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Удалить этот вопрос?")) return;
  
    axios
      .delete(`http://127.0.0.1:8081/api/questions/${id}`)
      .then(() => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      })
      .catch((err) => {
        console.error("Ошибка при удалении", err);
        alert("Ошибка при удалении вопроса");
      });
  };


  return (
    <>
      <Sidebar />
      <main>
        <div style={{ padding: "32px 90px" }}>
          <div className="container">
            <h1>Вопросы</h1>

            <div style={{ marginBottom: "16px" }}>
              <label>Раздел: </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">-- Выбери раздел --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {topics.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <label>Тема: </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">-- Выбери тему --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedSection && selectedTopic && (
              <div
                style={{
                  marginBottom: "24px",
                  border: "1px solid #ddd",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <h2>Добавить вопрос</h2>

                <div style={{ marginBottom: "12px" }}>
                  <label>Текст вопроса:</label>
                  <br />
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    style={{ width: "100%", padding: "8px" }}
                  />
                </div>

                <h4>Варианты ответа:</h4>
                {answers.map((a, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      value={a.text}
                      placeholder={`Ответ ${index + 1}`}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[index].text = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      style={{ flex: 1, padding: "6px" }}
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={a.is_correct}
                        onChange={() => {
                          const newAnswers = [...answers];
                          newAnswers[index].is_correct =
                            !newAnswers[index].is_correct;
                          setAnswers(newAnswers);
                        }}
                      />
                      Верный
                    </label>
                    <button
                      onClick={() => {
                        const newAnswers = answers.filter(
                          (_, i) => i !== index
                        );
                        setAnswers(newAnswers);
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setAnswers([...answers, { text: "", is_correct: false }])
                  }
                  style={{ marginBottom: "12px" }}
                >
                  Добавить ответ
                </button>

                <br />

                <button onClick={handleSubmit}>Сохранить вопрос</button>
              </div>
            )}

            {loading && <p>Загрузка вопросов...</p>}

            {!loading && selectedSection && topics.length === 0 && (
              <p>В разделе нету тем и вопросов.</p>
            )}

            {!loading &&
              selectedSection &&
              topics.length > 0 &&
              selectedTopic &&
              questions.length === 0 && <p>В этой теме пока нет вопросов.</p>}


{questions.map((question) => (
  <div
    key={question.id}
    style={{
      marginBottom: "24px",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      position: "relative"
    }}
  >
    <button
      onClick={() => handleDelete(question.id)}
      style={{
        position: "absolute",
        right: "8px",
        top: "8px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        padding: "6px 10px",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Удалить
    </button>
    <h3>{question.text}</h3>
    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
      {question.answers.map((answer) => (
        <li
          key={answer.id}
          style={{
            backgroundColor: answer.is_correct ? "#d4edda" : "#f8f9fa",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "6px",
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
      </main>
    </>
  );
};

export default Questions;













// import React, { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import axios from "axios";

// const Questions = () => {
//     const [sections, setSections] = useState([]);
//     const [selectedSection, setSelectedSection] = useState("");
//     const [topics, setTopics] = useState([]);
//     const [selectedTopic, setSelectedTopic] = useState("");
//     const [questions, setQuestions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [questionText, setQuestionText] = useState("");
//     const [answers, setAnswers] = useState([{ text: "", is_correct: false }]);


//   // получение всех разделов
//   useEffect(() => {
//     axios.get("http://127.0.0.1:8081/api/sections")
//       .then((res) => setSections(res.data))
//       .catch((err) => console.error("Ошибка загрузки разделов", err));
//   }, []);

//   // загрузка тем при выборе раздела
//   useEffect(() => {
//     if (!selectedSection) {
//       setTopics([]);
//       setSelectedTopic("");
//       return;
//     }

//     axios.get(`http://127.0.0.1:8081/api/topics?sectionId=${selectedSection}`)
//       .then((res) => setTopics(res.data))
//       .catch((err) => console.error("Ошибка загрузки тем", err));
//   }, [selectedSection]);

//   // загрузка вопросов при выборе темы
//   useEffect(() => {
//     if (!selectedSection || !selectedTopic) {
//       setQuestions([]);
//       return;
//     }

//     setLoading(true);
//     axios.get(`http://127.0.0.1:8081/api/questions?sectionId=${selectedSection}&topicId=${selectedTopic}`)
//       .then((res) => setQuestions(res.data))
//       .catch((err) => console.error("Ошибка загрузки вопросов", err))
//       .finally(() => setLoading(false));
//   }, [selectedTopic, selectedSection]);

//   return (
//     <>
//       <Sidebar />
//       <main>
//         <div style={{ padding: "32px 90px" }}>
//           <div className="container">
//             <h1>Вопросы</h1>

//             <div style={{ marginBottom: "16px" }}>
//               <label>Раздел: </label>
//               <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
//                 <option value="">-- Выбери раздел --</option>
//                 {sections.map((s) => (
//                   <option key={s.id} value={s.id}>{s.name}</option>
//                 ))}
//               </select>
//             </div>

//             {topics.length > 0 && (
//               <div style={{ marginBottom: "16px" }}>
//                 <label>Тема: </label>
//                 <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
//                   <option value="">-- Выбери тему --</option>
//                   {topics.map((t) => (
//                     <option key={t.id} value={t.id}>{t.name}</option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {loading && <p>Загрузка вопросов...</p>}

//             {!loading && selectedSection && topics.length === 0 && (
//                 <p>В разделе нету тем и вопросов.</p>
//             )}

//             {!loading && selectedSection && topics.length > 0 && selectedTopic && questions.length === 0 && (
//                 <p>В этой теме пока нет вопросов.</p>
//             )}

//             <div>
//             {questions.map((question) => (
//                 <div key={question.id} style={{ marginBottom: '24px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
//                 <h3>{question.text}</h3>
//                 <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
//                     {question.answers.map((answer) => (
//                     <li
//                         key={answer.id}
//                         style={{
//                         backgroundColor: answer.is_correct ? '#d4edda' : '#f8f9fa',
//                         padding: '8px',
//                         borderRadius: '4px',
//                         marginBottom: '6px',
//                         }}
//                     >
//                         {answer.text}
//                     </li>
//                     ))}
//                 </ul>
//                 </div>
//             ))}
//             </div>

//           </div>
//         </div>
//       </main>
//     </>
//   );
// };

// export default Questions;
