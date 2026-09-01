import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "../../../types/user";
import { useUserStore } from "../../../store/UserStore";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  initialUserData: User;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onCancel,
  initialUserData,
  onConfirm,
}) => {
  const [UserData, setUserData] = useState<User>(initialUserData);
  const userStore = useUserStore();
  useEffect(() => {
    if (isOpen) {
      setUserData(initialUserData);
    }
    console.log(initialUserData);
  }, [isOpen]);
  const handleCancel = () => {
    const clearUserData: User = {
      user_id: 0,
      user_name: "",
      user_position: "",
      user_username: "",
      user_password: "",
    };
    setUserData(clearUserData);
    onCancel();
  };
  const saveDeleteUser = () => {
    if (initialUserData.user_id > 0) {
      userStore.deleteUser(UserData.user_id);
      onConfirm()
      handleCancel();
      
    }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            ยืนยันการลบข้อมูล
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            คุณต้องการลบผู้ใช้งานหรือไม่?
          </p>
          <div className="flex justify-around">
            <button
              id="btnOk"
              onClick={saveDeleteUser}
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
            >
              ยืนยัน
            </button>
            <button
              id="btnCancel"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteUserDialog;
