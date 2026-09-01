import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";

interface AddLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  qrCodeUrl: string; 
}

const AddLineDialog: React.FC<AddLineDialogProps> = ({ isOpen, onClose, qrCodeUrl, onSubmit }) => {
  if (typeof document === "undefined") return null;

  const handleCancel = () => {
    if (onSubmit) onSubmit();
    onClose();
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="fixed inset-0 z-50 flex justify-center items-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90%] p-6 text-center relative">
              <h2 className="text-3xl font-semibold mb-4 text-center text-[#2E5361]">Scan QR Code</h2>

              <div className="flex justify-center mb-6">
                <img
                  id="qrCode"
                  src={qrCodeUrl}
                  alt="Line QR Code"
                  className="w-48 h-48 rounded-lg shadow-lg border border-gray-200"
                />
              </div>

              <div className="text-[#898686] text-base text-left leading-relaxed mb-6">
                <p className="mb-2 font-semibold text-base">วิธีเข้าร่วมกลุ่มไลน์ผ่าน QR Code :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>สแกน QR Code เพื่อเพิ่มบอทไลน์</li>
                  <li>สร้างกลุ่มไลน์สำหรับรับการแจ้งเตือน</li>
                  <li>เชิญบอทเข้ากลุ่ม เพื่อให้บอททำการแจ้งเตือน</li>
                  <li>เปิดการแจ้งเตือนกลุ่ม เพื่อไม่พลาดการแจ้งเตือนใหม่</li>
                </ol>
              </div>

              <button
                id="btnCancel"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transform transition-transform hover:-translate-y-1 hover:scale-110 cursor-pointer cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddLineDialog;
