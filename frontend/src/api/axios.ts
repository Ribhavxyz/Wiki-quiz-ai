import axios from "axios";

const api = axios.create({
  baseURL: "https://wiki-quiz-ai.onrender.com", 
});

export default api;
