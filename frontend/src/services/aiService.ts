import axios from "axios";

const API_BASE = "http://localhost:8001"; // backend ที่รัน FastAPI

export async function askAI(question: string) {
  try {
    const response = await axios.post(`${API_BASE}/ai/ask`, { question });
    return response.data; // ได้เป็น SQLResponse
  } catch (err: any) {
    console.error("Error calling AI API:", err);
    throw err;
  }
}
