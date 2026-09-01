import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { lineService } from "../../../services/lineService";

interface LineGroup {
  line_group_id: string;
  line_group_name: string;
}

interface DeleteLineGroupDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  initialGroupData: LineGroup | null;
  onDeleteSuccess?: () => void;
}

const DeleteLineGroupDialog: React.FC<DeleteLineGroupDialogProps> = ({
  isOpen,
  onCancel,
  initialGroupData,
  onDeleteSuccess,
}) => {
  const [groupData, setGroupData] = useState<LineGroup | null>(initialGroupData);

  useEffect(() => {
    if (isOpen) {
      setGroupData(initialGroupData);
    }
  }, [isOpen, initialGroupData]);

  const handleCancel = () => {
    setGroupData(null);
    onCancel();
  };

  const handleConfirm = async () => {
    if (!groupData) return;
    try {
      await lineService.deleteLineGroup(groupData.line_group_id);
      onDeleteSuccess?.();
      handleCancel();
    } catch (err) {
      console.error("Failed to delete line group", err);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
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
        <div className="bg-white rounded-xl p-6 shadow-xl w-96 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            ยืนยันการลบข้อมูล
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            คุณต้องการลบ "{groupData?.line_group_name ?? ""}" หรือไม่?
          </p>
          <div className="flex justify-around">
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
            >
              ยืนยัน
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DeleteLineGroupDialog;
