import React, { useEffect, useState } from "react";
import type { Patient } from "../../types/patient";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";
import { PlusCircle } from "lucide-react";
import AddPatientDialog from "./AddPatientDialog";
import { FaUser } from "react-icons/fa";
import { usePatientStore } from "../../store/patientStore";

interface Props {
  patient_config: Patient | undefined | null;
  onPatientSelect: (patient: Patient | undefined) => void;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ""; // ถ้าไม่มีค่าวันที่ ให้ return ค่าว่าง
  return new Date(dateString).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PatientWindow: React.FC<Props> = ({
  patient_config,
  onPatientSelect,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<
    Patient | undefined | null
  >(patient_config);
  const { loadPatientsWait, patients, removePatient } = usePatientStore();

  useEffect(() => {
    // อัปเดต selectedPatient เมื่อ patient_config เปลี่ยนแปลง
    if (patient_config) {
      setSelectedPatient(patient_config);
    }
  }, [patient_config]);

  useEffect(() => {
    // โหลด patients แค่ครั้งเดียวตอนเริ่มต้น
    loadPatientsWait();
  }, [patients.length]);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    onPatientSelect(patient); // ส่งค่ากลับไป C
    closeDialog();
  };

  const handleDeletePatient = () => {
    if (selectedPatient) {
      // Remove the patient from the list using the store's removePatient method
      removePatient(selectedPatient.patient_id); // Assuming removePatient accepts patient_id
      setSelectedPatient(undefined);
      onPatientSelect(undefined);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="border-2 border-gray-300 rounded-md w-full bg-[#F0F0F0] p-3 mt-3 h-73 shadow-md">
        <div className="flex items-center p-3 text-xl font-semibold">
          <FaUser className="mr-2 text-2xl text-[#2E5361]" /> รายละเอียดผู้ป่วย
        </div>
        <div className="flex justify-center items-center p-5">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] mt-8 transition-transform duration-300 hover:scale-110"
            onClick={openDialog}
            id="btnAddPatient"
          >
            <PlusCircle size={24} />
            <span className="text-lg cursor-pointer">เพิ่มผู้ป่วย</span>
          </button>
          <AddPatientDialog
            isOpen={isDialogOpen}
            onClose={closeDialog}
            onSelectPatient={handleSelectPatient}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedPatient !== undefined && (
        <div className="border-2 border-gray-300 rounded-md w-full bg-[#F0F0F0] p-3 mt-3 shadow-md">
          <div className="flex items-center p-3 text-xl font-semibold">
            <FaUser className="mr-2 text-2xl text-[#2E5361]" />
            รายละเอียดผู้ป่วย
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_id"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                รหัสผู้ป่วย:
              </label>
              <input
                id="patient_id"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_id || ""}
                placeholder="กรอกรหัสผู้ป่วย"
                readOnly
              />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_name"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                ชื่อ-นามสกุล:
              </label>
              <input
                id="patient_name"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_name || ""}
                placeholder="Enter patient name"
                readOnly
              />
            </div>

            {/* อายุ */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_age"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                อายุ:
              </label>
              <input
                id="patient_age"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_age || ""}
                placeholder="Enter patient age"
                readOnly
              />
            </div>

            {/* วันเกิด */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_birthdate"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                วันเกิด:
              </label>
              <input
                id="patient_birthdate"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={formatDate(selectedPatient?.patient_dob)}
                readOnly
              />
            </div>

            {/* เพศ */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_gender"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                เพศ:
              </label>
              <input
                id="patient_gender"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_gender || ""}
                readOnly
              />
            </div>

            {/* หมู่เลือด */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_blood"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                หมู่เลือด:
              </label>
              <input
                id="patient_blood"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_bloodtype || ""}
                readOnly
              />
            </div>

            {/* โรคประจำตัว */}
            <div className="flex items-center p-2 w-full">
              <label
                htmlFor="patient_treatment"
                className="text-right min-w-[100px] flex-shrink-0 font-medium mr-4"
              >
                โรคประจำตัว:
              </label>
              <input
                id="patient_treatment"
                type="text"
                className="border border-gray-300 rounded-xl w-full pl-3"
                value={selectedPatient?.patient_disease || ""}
                readOnly
              />
            </div>
          </div>

          {/* ปุ่มลบ */}
          <div className="flex justify-end mt-4 mr-2">
            <button
              type="button"
              title="Delete patient record"
              aria-label="Delete patient record"
              className="p-3 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={handleDeletePatient}
              id="btnDelPatient"
            >
              <Icon path={mdiDelete} size={1} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientWindow;
