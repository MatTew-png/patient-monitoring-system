import axios from "axios";
// import { useAuthStore } from "../store/authStore";

// export const baseURL = "http://localhost:8000/";

// Docker Deploy
export const baseURL = "http://localhost:8030/";

// สร้าง instance ของ Axios
const instance = axios.create({
  baseURL: baseURL, // เปลี่ยนเป็น API ของคุณ
});

export function buildUrl(path?: string | null) {
  if (!path) return null;
  return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

// ฟังก์ชัน Delay (mock delay เพื่อจำลอง latency)
function delay(sec: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(sec), sec * 1000);
  });
}

// Interceptor สำหรับ Response (เพิ่ม delay 200ms)
instance.interceptors.response.use(
  async (res) => {
    await delay(0.2);
    return res;
  },
  (error) => {
    // if (error.response?.status === 401) {
    //   const { clearAuth } = useAuthStore.getState(); // ✅ ดึง method ได้ตรงๆ
    //   clearAuth();
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

export default instance;
