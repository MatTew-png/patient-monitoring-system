import React, { useState, useRef, useEffect } from "react";
import Aichatpng from "../../assets/Aichat.png"; // ✅ ปรับ path
import { askAI } from "../../services/aiService"; // ✅ import service

interface Message {
  from: "user" | "assistant";
  text: string;
}

const AiChatToggle: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "assistant", text: "สวัสดี! มีอะไรให้ช่วยไหม?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll ลงล่างสุดเวลา messages เปลี่ยน
  useEffect(() => {
    if (panelRef.current) {
      const container = panelRef.current.querySelector(
        "#chat-messages"
      ) as HTMLDivElement;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAI(userMessage.text);

      const botMessage = {
        from: "assistant" as const,
        text: res.answer || "ขออภัยค่ะ ไม่สามารถหาคำตอบได้",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "assistant", text: "เกิดข้อผิดพลาดในการเรียก AI" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-2">
      {open && (
        <div
          className="w-[320px] max-h-[480px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-200"
          aria-label="AI Chat Panel"
          ref={panelRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#2E5361] text-white">
            <div className="font-semibold">AI Chat</div>
            <button
              id="btnClose"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-xl leading-none px-2"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            id="chat-messages"
            className="flex-1 overflow-auto px-4 py-2 space-y-3 bg-gray-50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.from === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`rounded-xl p-2 text-sm max-w-[70%] break-words whitespace-pre-wrap ${
                    m.from === "assistant"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-[#95BAC3] text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 text-sm rounded-xl p-2">
                  กำลังประมวลผล...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-200 flex gap-2">
            <textarea
              id="typeQuestion"
              aria-label="Type your message"
              className="flex-1 resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8892]"
              placeholder="พิมพ์คำถาม..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />
            <button
              id="btnSent"
              onClick={handleSend}
              disabled={loading}
              className="bg-[#5E8892] hover:bg-[#4a6f7a] text-white px-4 py-2 rounded-lg flex-shrink-0 disabled:opacity-50"
            >
              ส่ง
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        id="AiChat"
        aria-label="Toggle AI Chat"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#95BAC3] to-[#2E5361] shadow-lg hover:scale-105 transform transition"
      >
        <img
          src={Aichatpng}
          alt="AI Chat Icon"
          className="w-10 h-10 object-contain filter invert brightness-0"
        />
      </button>
    </div>
  );
};

export default AiChatToggle;
