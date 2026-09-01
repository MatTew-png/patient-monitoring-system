import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { mdiFileImport, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useLocationStore } from "../../../store/locationStore";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose,onConfirm }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const locationStore = useLocationStore();

  // เคลียร์ไฟล์ที่เลือกเมื่อ dialog ปิด
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      setIsImporting(true);
      await locationStore.importLocation(selectedFile);
      console.log("นำเข้าสำเร็จ"); // เพิ่ม toast หรือ UI feedback ได้ตรงนี้
      onClose();
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการนำเข้า:", err);
    } finally {
      onConfirm();
      setIsImporting(false);
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="fixed inset-0 z-50 flex justify-center items-center"
          >
            <div
              className="bg-white px-8 py-6 rounded-[25px] shadow-xl w-[420px] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="btnCancel"
                onClick={onClose}
                className="absolute top-4 right-4 text-[#2E5361] hover:text-black"
              >
                <Icon path={mdiClose} size={1.2} />
              </button>

              <h2 className="text-3xl font-bold text-center text-[#2E5361] mb-6">
                นำเข้า
              </h2>

              <div className="relative">
                <input
                  ref={inputFileRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  className="hidden"
                />
                <input
                  type="text"
                  readOnly
                  value={selectedFile?.name || ""}
                  placeholder="เลือกไฟล์"
                  className="w-full pl-4 pr-12 py-3 border border-black rounded-[12px] placeholder-gray-400 text-gray-700 cursor-pointer"
                  onClick={() => inputFileRef.current?.click()}
                />
                <button
                  type="button"
                  onClick={() => inputFileRef.current?.click()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#2E5361] rounded-full p-2"
                >
                  <Icon path={mdiFileImport} size={0.8} color="#ffffff" />
                </button>
              </div>

              <button
                id="btnConfirm"
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className={`block mx-auto mt-6 px-6 py-2 rounded-[20px] font-semibold shadow transition ${
                  isImporting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#95BAC3] hover:bg-[#5E8892] text-black"
                }`}
              >
                {isImporting ? "กำลังนำเข้า..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImportDialog;
