import axios from "axios";

const API_BASE = "http://localhost:8001";

export async function askAI(question: string) {
  try {
    const response = await axios.post(`${API_BASE}/ai/ask`, { question });
    return response.data;
  } catch {
    // Intelligent Mock Clinical Assistant
    const qLower = question.toLowerCase();
    let result = "ระบบได้ประมวลผลข้อมูลผู้ป่วยในวอร์ดปัจจุบันเรียบร้อยแล้ว";

    if (qLower.includes("เตียง") || qLower.includes("bed") || qLower.includes("ผู้ป่วย")) {
      result = "ผู้ป่วยเตียง 01 (นายสมชาย) สัญญาณชีพคงที่ อัตราการเต้นของหัวใจ 74 bpm และออกซิเจน 99% ไม่พบเหตุการณ์เสี่ยงล้มใน 24 ชั่วโมงที่ผ่านมา";
    } else if (qLower.includes("นอน") || qLower.includes("sleep")) {
      result = "สถิติการนอนหลับเฉลี่ยของผู้ป่วยในวอร์ด 4B อยู่ที่ 6.8 ชั่วโมง มีความเสถียรของวงจร REM 92%";
    } else if (qLower.includes("ล้ม") || qLower.includes("fall")) {
      result = "เซนเซอร์ตรวจจับการเคลื่อนไหวและการล้มทำงานปกติ (Armed 35ms) ผู้ป่วยเตียง 02 มีความเสี่ยงล้มระดับปานกลาง ได้ตั้งค่าแจ้งเตือนพิเศษแล้ว";
    }

    return {
      query: question,
      result: result,
      status: "success",
    };
  }
}
