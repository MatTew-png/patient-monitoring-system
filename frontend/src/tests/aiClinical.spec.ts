import { describe, it, expect } from "vitest";
import { askAI } from "../services/aiService";

describe("🤖 LLM AI Clinical Assistant (AiAsk) Automation Suite", () => {
  it("TC-AI-001: should return natural language summary for bed inquiries", async () => {
    const response = await askAI("สรุปอาการผู้ป่วยเตียง 01 ให้หน่อย");
    expect(response).toBeDefined();
    expect(response.status).toBe("success");
    expect(response.result).toContain("ผู้ป่วยเตียง 01");
    expect(response.result).toContain("นายสมชาย");
  });

  it("TC-AI-002: should analyze sleep statistics across ward 4B", async () => {
    const response = await askAI("สถิติการนอนหลับเฉลี่ยเป็นอย่างไร");
    expect(response).toBeDefined();
    expect(response.result).toContain("ชั่วโมง");
  });

  it("TC-AI-003: should return fall risk assessment analysis", async () => {
    const response = await askAI("รายงานความเสี่ยงการล้ม");
    expect(response).toBeDefined();
    expect(response.result).toContain("เซนเซอร์ตรวจจับการเคลื่อนไหวและการล้ม");
  });
});
