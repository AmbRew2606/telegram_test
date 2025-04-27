// src/api.js
const BASE_URL = "http://localhost:8081"; // URL твоего Go-сервера

export const getMessage = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/message`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Fetch error: ", error);
  }
};
