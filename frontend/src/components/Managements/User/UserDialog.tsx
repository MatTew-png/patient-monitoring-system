import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import AddUserIcon from "../../../assets/btnManagement/AddUser.png";
import { User } from "../../../types/user";
import { useUserStore } from "../../../store/UserStore";
import { Ward } from "../../../types/ward";
import { wardService } from "../../../services/wardService";
import { buildUrl } from "../../../services/http";

interface UserDialogProps {
  isOpen: boolean;
  user: User | null;
  onCancel: () => void;
  onSaved: () => void; // ✅ เพิ่ม callback นี้
}

const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  user,
  onCancel,
  onSaved,
}) => {
  const [formData, setFormData] = useState<Omit<User, "user_id">>({
    user_name: "",
    user_position: "",
    user_username: "",
    user_password: "",
    ward_id: undefined,
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const userStore = useUserStore();
  const positions = ["Admin", "Nurse", "Doctor"];

  useEffect(() => {
    console.log("👤 Current user data:", user);

    if (user) {
      setFormData({
        user_name: user.user_name,
        user_position: user.user_position,
        user_username: user.user_username,
        user_password: user.user_password,
        ward_id: user.ward_id ?? undefined,
      });

      if (user.image_path) {
        setPreview(buildUrl(user.image_path));
      } else {
        setPreview(null);
      }
    } else {
      setFormData({
        user_name: "",
        user_position: "",
        user_username: "",
        user_password: "",
      });
      setPreview(null);
      setImage(null);
    }
    const fetchWards = async () => {
      const res = await wardService.getWards();
      setWards(res);
    };

    if (isOpen) fetchWards();
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "user_position" && value === "Admin") {
      setFormData((prev) => ({ ...prev, ward_id: undefined }));
    }
  };

  const handleSave = async () => {
    if (
      !formData.user_name ||
      !formData.user_username ||
      !formData.user_password
    ) {
      alert("กรุณากรอก Username, Password และชื่อผู้ใช้งานให้ครบ");
      return;
    }

    try {
      let userId = user?.user_id ?? 0;

      if (!user || userId === 0) {
        // เพิ่มผู้ใช้ใหม่
        try {
          const newUser = await userStore.addUser(formData);
          userId = newUser.user_id;

          if (image) {
            const imageUrl = await userStore.addUserImage(userId, image);
            setPreview(buildUrl(imageUrl ?? ""));
          }
        } catch (err) {
          alert(
            "Username ที่ท่านระบุมีอยู่แล้วในระบบ กรุณากรอก Username อื่นๆ"
          );
          return;
        }
      } else {
        // แก้ไขผู้ใช้
        console.log("📤 Saving user data:", formData);
        await userStore.editUser(userId, formData);

        if (image) {
          const imageUrl = await userStore.addUserImage(userId, image);
          setPreview(buildUrl(imageUrl ?? ""));
        }
      }

      await onSaved();
      onCancel();
    } catch (err) {
      console.error("❌ Failed to save user", err);
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
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-fit max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-semibold mb-4 text-center text-[#2E5361]">
            {user?.user_id !== 0 ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มข้อมูลผู้ใช้"}
          </h2>

          <div className="flex gap-6 mb-4">
            {/* รูปโปรไฟล์ */}
            <div className="flex-shrink-0">
              <label className="cursor-pointer relative w-32 h-32 rounded-md border border-gray-300 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition">
                {preview ? (
                  <img
                    id="preview"
                    src={preview}
                    alt="preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <img
                    id="default"
                    src={AddUserIcon}
                    alt="default"
                    className="w-20 h-23 opacity-50"
                  />
                )}
                <input
                  id="addImg"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            {/* ฟอร์มข้อมูลผู้ใช้ */}
            <div className="flex flex-col gap-4 min-w-0 w-80">
              {/* Username */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="user_username"
                  type="text"
                  value={formData.user_username}
                  onChange={handleChange}
                  placeholder="กรุณากรอก Username"
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full  h-11 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Password
                </label>
                <input
                  id="pass"
                  name="user_password"
                  type="password"
                  value={formData.user_password}
                  onChange={handleChange}
                  placeholder="กรุณากรอก Password"
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full  h-11 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  id="name"
                  name="user_name"
                  type="text"
                  value={formData.user_name}
                  onChange={handleChange}
                  placeholder="กรุณากรอกชื่อผู้ใช้งาน"
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full  h-11 placeholder:text-gray-400"
                />
              </div>
              {/* 
              <div>
                <label className="block mb-1 text-sm text-gray-700">
                  วอร์ด
                </label>
                <select
                  id="ward"
                  name="ward_id"
                  value={formData.user_position}
                  onChange={handleChange}
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    formData.user_position ? "text-black" : "text-gray-400"
                  }`}
                >
                  <option value="" disabled hidden>
                    กรุณาเลือกตำแหน่งงาน
                  </option>
                  {positions.map((position) => (
                    <option
                      key={position}
                      value={position}
                      className="text-black"
                    >
                      {position}
                    </option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  ตำแหน่ง
                </label>
                <select
                  id="position"
                  name="user_position"
                  value={formData.user_position}
                  onChange={handleChange}
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    formData.user_position ? "text-black" : "text-gray-400"
                  }`}
                >
                  <option value="" disabled hidden>
                    กรุณาเลือกตำแหน่งงาน
                  </option>
                  {positions.map((position) => (
                    <option
                      key={position}
                      value={position}
                      className="text-black"
                    >
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  วอร์ด
                </label>
                <select
                  id="ward"
                  name="ward_id"
                  disabled={formData.user_position === "Admin"}
                  value={formData.ward_id ?? ""} // ✅ ถ้าไม่มี ward_id จะเป็น ""
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ward_id:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value), // ✅ แปลงเป็น number หรือ undefined
                    }))
                  }
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    formData.ward_id ? "text-black" : "text-gray-400"
                  }`}
                >
                  {/* ✅ option สำหรับไม่มีวอร์ด */}
                  <option value="">ไม่มีวอร์ด</option>

                  {wards.map((ward) => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.ward_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* ✅ หมายเหตุ */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 italic">
              *ระบบเป็นผู้กำหนด <span className="font-semibold">Username</span>{" "}
              และ <span className="font-semibold">Password</span>{" "}
              ผู้ใช้งานไม่มีสิทธิแก้ไข
              <br />
              กรณีย้ายวอร์ด Password จะถูกเปลี่ยนใหม่
              และทางโรงพยาบาลจะเป็นผู้แจ้ง
            </p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              id="btnCancel"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btnSave"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-[#95BAC3] text-white hover:bg-[#5E8892] transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer"
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

export default UserDialog;
