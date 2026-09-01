import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { lineService } from "../../../services/lineService";
import { useWardStore } from "../../../store/wardStore";
import { Ward } from "../../../types/ward";

interface LineGroupDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: { groupId: string; groupName: string; wardId: number } | null;
  onSaveSuccess?: () => void;
}

const LineGroupDialog: React.FC<LineGroupDialogProps> = ({
  open,
  onClose,
  initialData,
  onSaveSuccess,
}) => {
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [wardId, setWardId] = useState<number | "">(""); // <-- number or empty
  const [wards, setWards] = useState<Ward[]>([]);

  const { getWards } = useWardStore();

  // fetch ward list when dialog opens
  useEffect(() => {
    if (open) {
      getWards().then(setWards);
    }
  }, [open]);

  // set initial data
  useEffect(() => {
    if (open && initialData) {
      setGroupId(initialData.groupId || "");
      setGroupName(initialData.groupName || "");
      setWardId(initialData.wardId ?? "");
    } else if (open) {
      setGroupId("");
      setGroupName("");
      setWardId("");
    }
  }, [open, initialData]);

  const handleSave = async () => {
    try {
      await lineService.updateLineGroup(groupId, {
        line_group_id: groupId,
        line_group_name: groupName,
        ward_id: typeof wardId === "number" ? wardId : 0, // ถ้า wardId เป็น "" ส่ง 0 แทน
      });
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to update line group", err);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <div
          className="bg-white rounded-xl p-6 w-[400px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-semibold text-center text-[#2E5361] mb-4">
            จัดการกลุ่มไลน์
          </h2>

          {/* Group ID */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Group ID :
            </label>
            <input
              type="text"
              value={groupId}
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-200"
            />
          </div>

          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              ชื่อกลุ่มไลน์ :
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="กรอกชื่อกลุ่มไลน์"
            />
          </div>

          {/* Ward */}
          <div className="mb-6 relative z-50">
            <label className="block text-gray-700 font-medium mb-1">
              วอร์ด :
            </label>
            <select
              value={wardId}
              onChange={(e) =>
                setWardId(e.target.value ? Number(e.target.value) : "")
              }
              className={`w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer ${
                wardId !== "" ? "text-black" : "text-gray-400"
              }`}
            >
              {/* ตัวเลือกวอร์ดว่าง */}
              <option value="">ไม่เลือกวอร์ด</option>

              {/* ตัวเลือกวอร์ดปกติ */}
              {wards.map((w) => (
                <option key={w.ward_id} value={w.ward_id}>
                  {w.ward_name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] transition"
            >
              บันทึก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LineGroupDialog;
