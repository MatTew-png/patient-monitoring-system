import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import { Patient } from "../../../types/patient";
import AddUserIcon from "../../../assets/btnManagement/AddUser.png";
import { usePatientStore } from "../../../store/patientStore";
import { buildUrl } from "../../../services/http"; // ✅ import baseURL มาใช้

interface PatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialPatientData: Patient;
}

const PatientDialog: React.FC<PatientDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPatientData,
}) => {
  const [patientData, setPatientData] = useState<Patient>(initialPatientData);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const patientStore = usePatientStore();
  const [nameError, setNameError] = useState("");
  const [diseaseError, setDiseaseError] = useState("");
  // ✅ ฟังก์ชันคำนวณอายุจากวันเกิด
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const isFormValid =
    (patientData.patient_name?.trim() ?? "") !== "" &&
    (patientData.patient_age ?? 0) > 0 &&
    (patientData.patient_dob?.trim() ?? "") !== "" &&
    (patientData.patient_gender?.trim() ?? "") !== "" &&
    (patientData.patient_bloodtype?.trim() ?? "") !== "" &&
    (patientData.patient_date_in?.trim() ?? "") !== "";

  useEffect(() => {
    if (isOpen) {
      setPatientData({
        ...initialPatientData,
        patient_date_in:
          initialPatientData.patient_date_in?.trim() !== ""
            ? initialPatientData.patient_date_in
            : new Date().toISOString().split("T")[0],
        patient_age: initialPatientData.patient_dob
          ? calculateAge(initialPatientData.patient_dob)
          : 0,
      });
      setImage(null);
      if (initialPatientData.image_path) {
        setPreview(buildUrl(initialPatientData.image_path));
      } else {
        setPreview(null);
      }
    }
  }, [isOpen, initialPatientData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // ตรวจสอบความยาวก่อนบันทึก
    if ((patientData.patient_name?.length ?? 0) > 50) {
      alert("ชื่อผู้ป่วยต้องไม่เกิน 50 ตัวอักษร");
      return;
    }

    if ((patientData.patient_disease?.length ?? 0) > 30) {
      alert("โรคประจำตัวต้องไม่เกิน 30 ตัวอักษร");
      return;
    }

    // ฟิลด์อื่นๆ ถูกต้อง
    if (initialPatientData.patient_id == 0) {
      const data = await patientStore.addPatient(patientData);
      initialPatientData.patient_id = data.patient_id;
    } else {
      await patientStore.editPatient(patientData);
    }

    if (image && initialPatientData.patient_id) {
      patientStore.addImageToPatient(image, initialPatientData.patient_id);
    }

    alert("บันทึกสำเร็จ");
    onSubmit();
    onClose();
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
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-auto">
          <h2 className="text-3xl font-semibold mb-4 text-center text-[#2E5361]">
            {initialPatientData.patient_id !== 0
              ? "แก้ไขข้อมูลผู้ป่วย"
              : "เพิ่มข้อมูลผู้ป่วย"}
          </h2>

          {/* กล่องหลักที่รวมรูปและฟอร์มไว้แนวนอน */}
          <div className="flex gap-6 mb-4">
            {/* รูปผู้ป่วย */}
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

            {/* ฟอร์มผู้ป่วย */}
            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  รหัสผู้ป่วย
                </label>
                <input
                  id="patient_id"
                  type="text"
                  value={patientData.patient_id}
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  ชื่อ-นามสกุล
                </label>
                <input
                  id="patient_name"
                  type="text"
                  value={patientData.patient_name}
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 placeholder:text-gray-400"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 50) {
                      setNameError("ชื่อผู้ป่วยไม่เกิน 50 ตัวอักษร");
                    } else {
                      setNameError("");
                    }
                    setPatientData({
                      ...patientData,
                      patient_name: value.slice(0, 50),
                    });
                  }}
                />
                {nameError && <div className="text-red-500 text-sm mt-1">{nameError}</div>}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  อายุ
                </label>
                <input
                  id="patient_age"
                  type="number"
                  value={patientData.patient_age}
                  disabled
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  วันเกิด
                </label>
                <input
                  id="patient_dob"
                  type="date"
                  value={patientData.patient_dob}
                  onChange={(e) => {
                    const dob = e.target.value;
                    setPatientData({
                      ...patientData,
                      patient_dob: dob,
                      patient_age: calculateAge(dob), // ✅ คำนวณอายุใหม่อัตโนมัติ
                    });
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    patientData.patient_dob ? "text-black" : "text-gray-400"
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  เพศ
                </label>
                <select
                  id="patient_gender"
                  value={patientData.patient_gender}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      patient_gender: e.target.value,
                    })
                  }
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    patientData.patient_gender ? "text-black" : "text-gray-400"
                  }`}
                >
                  <option value="" disabled hidden>
                    กรุณาเลือกเพศ
                  </option>
                  <option value="ชาย" className="text-black">
                    ชาย
                  </option>
                  <option value="หญิง" className="text-black">
                    หญิง
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  หมู่เลือด
                </label>
                <select
                  id="patient_bloodtype"
                  value={patientData.patient_bloodtype}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      patient_bloodtype: e.target.value,
                    })
                  }
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    patientData.patient_bloodtype
                      ? "text-black"
                      : "text-gray-400"
                  }`}
                >
                  <option value="" disabled hidden>
                    กรุณาเลือกหมู่เลือด
                  </option>
                  <option value="A" className="text-black">
                    A
                  </option>
                  <option value="B" className="text-black">
                    B
                  </option>
                  <option value="AB" className="text-black">
                    AB
                  </option>
                  <option value="O" className="text-black">
                    O
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  โรคประจำตัว
                </label>
                <input
                  id="patient_disease"
                  type="text"
                  value={patientData.patient_disease}
                  placeholder="กรุณากรอกโรคประจำตัว"
                  className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 placeholder:text-gray-400"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 30) {
                      setDiseaseError("โรคประจำตัวไม่เกิน 30 ตัวอักษร");
                    } else {
                      setDiseaseError("");
                    }
                    setPatientData({
                      ...patientData,
                      patient_disease: value.slice(0, 30),
                    });
                  }}
                />
                {diseaseError && <div className="text-red-500 text-sm mt-1">{diseaseError}</div>}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  วันที่เข้ารักษา
                </label>
                <input
                  id="patient_date_in"
                  type="date"
                  value={patientData.patient_date_in}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      patient_date_in: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    patientData.patient_date_in ? "text-black" : "text-gray-400"
                  }`}
                />
              </div>
              {/* ✅ กล่องเลือกสถานะผู้ป่วย */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  สถานะผู้ป่วย
                </label>
                <select
                  id="patient_status"
                  value={patientData.patient_status ?? ""}
                  onChange={(e) =>
                    setPatientData({
                      ...patientData,
                      patient_status: e.target.value,
                    })
                  }
                  className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                    patientData.patient_status ? "text-black" : "text-gray-400"
                  }`}
                >
                  <option value="" disabled hidden>
                    กรุณาเลือกสถานะ
                  </option>
                  <option value="ฟื้นตัว" className="text-black">
                    ฟื้นตัว
                  </option>
                  <option value="คงที่" className="text-black">
                    คงที่
                  </option>
                  <option value="วิกฤติ" className="text-black">
                    วิกฤติ
                  </option>
                </select>
              </div>
            </div>
          </div>
          {!isFormValid && (
            <div className="text-sm text-red-500 text-right mt-2">
              *กรุณากรอกชื่อ-นามสกุล อายุ วันเกิด เพศ หมู่เลือด
              และวันที่เข้ารักษาให้ครบถ้วน เพื่อดำเนินการต่อไป
            </div>
          )}

          {/* ปุ่ม */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              id="btnCancel"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btnSave"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`px-6 py-2 rounded-xl transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer
    ${
      isFormValid
        ? "bg-[#95BAC3] text-white hover:bg-[#5E8892]"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
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

export default PatientDialog;
