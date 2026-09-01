import React, { useState } from "react";
import type { Patient } from "../../types/patient";
import { motion, AnimatePresence } from "framer-motion";
import { usePatientStore } from "../../store/patientStore";

interface AddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  const [search, setSearch] = useState("");
  const patientStore = usePatientStore();

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient); // ส่งค่ากลับไป B แล้วไป C
    patientStore.patients = patientStore.patients.filter(
      (p) => p.patient_id !== patient.patient_id
    );
    // console.log(patientStore.patients);
  };

  const filteredPatients = patientStore.patients.filter((patient) =>
    (patient.patient_name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fully transparent overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="fixed inset-0 z-50 flex justify-center items-center"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-[1000px] max-h-[80vh] overflow-auto">
              <h2 className="text-2xl font-bold mb-4">เลือกผู้ป่วย</h2>

              <input
                id="searchPatient"
                type="text"
                placeholder="ค้นหาชื่อผู้ป่วย"
                className="w-full p-3 border border-gray-300 rounded-md mb-4 text-lg inset-shadow"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="overflow-auto max-h-[50vh]">
                <table className="w-full border-collapse border border-gray-300 text-lg">
                  <thead className="bg-[#95BAC3]">
                    <tr className="text-center">
                      <th className="border p-3">รหัสผู้ป่วย</th>
                      <th className="border p-3">ชื่อ-นามสกุล</th>
                      <th className="border p-3">อายุ</th>
                      <th className="border p-3">วันเกิด</th>
                      <th className="border p-3">เพศ</th>
                      <th className="border p-3">หมู่เลือด</th>
                      <th className="border p-3">การรักษา</th>
                      <th className="border p-3">เลือก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.patient_id}
                        className="hover:bg-gray-200"
                      >
                        <td className="border p-3">{patient.patient_id}</td>
                        <td className="border p-3">{patient.patient_name}</td>
                        <td className="border p-3 text-center">
                          {patient.patient_age}
                        </td>
                        <td className="border p-3 text-center">
                          {patient.patient_dob}
                        </td>
                        <td className="border p-3 text-center">
                          {patient.patient_gender}
                        </td>
                        <td className="border p-3 text-center">
                          {patient.patient_bloodtype}
                        </td>
                        <td className="border p-3">
                          {patient.patient_disease}
                        </td>
                        <td className="border p-3 text-center">
                          <button
                            className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md cursor-pointer"
                            onClick={() => handleSelectPatient(patient)}
                            id="btnSelect"
                          >
                            เลือก
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer"
                  onClick={onClose}
                  id="btnCancel"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPatientDialog;
