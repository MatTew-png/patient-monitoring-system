import React, { useEffect, useState } from "react";
import { Patient } from "../../../types/patient";
import { useParams } from "react-router-dom";
import { usePatientStore } from "../../../store/patientStore";
import PersonalBehavior from "../../../components/Managements/Patient/PersonalBehavior";
import MedicalHistory from "../../../components/Managements/Patient/MedicalHistory";
import { buildUrl } from "../../../services/http";

const PatientInformation: React.FC = () => {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState<Patient>();
  const [imgPath, setImgPath] = useState<string>();
  const patientStore = usePatientStore();
  const [activeTab, setActiveTab] = useState<
    "history" | "medical" | "behavior"
  >("history");

  const fetchPatientData = async (patient_id: number) => {
    const data = await patientStore.getPatientWithDetail(patient_id);
    setPatient(data);
  };

  useEffect(() => {
    if (patient_id) {
      fetchPatientData(Number(patient_id));
    }
  }, [patient_id]);

  useEffect(() => {
    if (patient) setImgPath(buildUrl(patient.image_path) ?? "");
    console.log(patient);
  }, [patient]);

  useEffect(() => {});
  return (
    // <div className="p-6 bg-[#e7f0f3] min-h-screen">
    <div className="p-6 bg-[#e7f0f3] h-screen overflow-hidden">
      {/* หัวข้อ */}
      <h1 className="text-3xl font-bold text-[#2E5361] mb-6">
        รายละเอียดข้อมูลผู้ป่วย
      </h1>

      {/* ข้อมูลผู้ป่วย */}
      <div className="bg-gradient-to-r from-[#A1B5BC] via-[#D1DFE5] to-[#e4ecef] rounded-xl shadow-md p-6 grid grid-cols-2 gap-4 mb-6">
        <div className="flex gap-6 pl-30">
          <div>
            <label className="cursor-pointer relative w-45 h-45 rounded-md border border-gray-300 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition">
              (
              <img
                id="preview"
                src={imgPath}
                alt="preview"
                className="object-cover w-full h-full"
              />
              )
            </label>
          </div>

          <div className="container mx-auto max-w-2xl font-medium text-2xl justify-items-end">
            <div className="grid grid-cols-2 gap-x-4 space-y-4">
              <div className="text-right font-bold">รหัสผู้ป่วย:</div>
              <div className="text-left pl-4" id="patient_id">
                P{patient?.patient_id?.toString().padStart(4, "0")}
              </div>

              <div className="text-right font-bold">อายุ:</div>
              <div className="text-left pl-4" id="patient_age">
                {patient?.patient_age}
              </div>

              <div className="text-right font-bold">เพศ:</div>
              <div className="text-left pl-4" id="patient_gender">
                {patient?.patient_gender}
              </div>

              <div className="text-right font-bold">โรคประจำตัว:</div>
              <div className="text-left pl-4" id="patient_disease">
                {patient?.patient_disease || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-2xl font-medium text-2xl justify-items-start">
          <div className="grid grid-cols-2 gap-x-4 space-y-4">
            <div className="text-right font-bold">ชื่อ-นามสกุล:</div>
            <div className="text-left pl-4" id="patient_name">
              {patient?.patient_name}
            </div>

            <div className="text-right font-bold">วันเกิด:</div>
            <div className="text-left pl-4" id="patient_dob">
              {patient?.patient_dob}
            </div>

            <div className="text-right font-bold">หมู่เลือด:</div>
            <div className="text-left pl-4" id="patient_bloodtype">
              {patient?.patient_bloodtype}
            </div>

            <div className="text-right font-bold">อาคาร/เตียง:</div>
            <div className="text-left pl-4" id="patient_bed">
              {[
                patient?.bed?.room?.floor?.building?.building_name,
                patient?.bed?.room?.floor?.floor_name,
                patient?.bed?.room?.room_name,
                patient?.bed?.bed_name,
              ]
                .filter(Boolean)
                .join(" ") || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มเมนู */}
      <div className="flex space-x-4 mb-4">
        <button
          id="btnHistory"
          className={`${
            activeTab === "history"
              ? "bg-[#95BAC3] text-white shadow-lg"
              : "bg-[#CFD1D2] text-black"
          } px-4 py-2 rounded-2xl shadow transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-[#5E8892]  cursor-pointer`}
          onClick={() => setActiveTab("history")}
        >
          ประวัติการรักษา
        </button>

        <button
          id="btnMedical"
          className={`${
            activeTab === "medical"
              ? "bg-[#95BAC3] text-white shadow-lg"
              : "bg-[#CFD1D2] text-black"
          } px-4 py-2 rounded-2xl shadow transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-[#5E8892] cursor-pointer`}
          onClick={() => setActiveTab("medical")}
        >
          ข้อมูลทางการแพทย์
        </button>

        <button
          id="btnBehavior"
          className={`${
            activeTab === "behavior"
              ? "bg-[#95BAC3] text-white shadow-lg"
              : "bg-[#CFD1D2] text-black"
          } px-4 py-2 rounded-2xl shadow transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-[#5E8892] cursor-pointer`}
          onClick={() => setActiveTab("behavior")}
        >
          พฤติกรรมส่วนบุคคล
        </button>

        <button
          id="btnAddRecord"
          className="ml-auto bg-[#CFD1D2] px-4 py-2 rounded-2xl shadow flex items-center transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 hover:bg-[#5E8892] cursor-pointer"
        >
          <img
            className="w-9 pr-2"
            src="/src/assets/btnManagement/AddProperties.png"
            alt="AddRecord"
          />{" "}
          เพิ่มบันทึกใหม่
          {/* <span className="text-xl mr-2">➕</span>  */}
        </button>
      </div>

      <div>
        {activeTab === "history" && <MedicalHistory />}

        {activeTab === "medical" && <div>medical</div>}

        {activeTab === "behavior" && <PersonalBehavior />}
      </div>
      {/* <button
        onClick={() => window.history.back()}
        className="bg-[#B3B3B3] px-4 py-2 rounded shadow flex items-center"
      >
        <span className="text-xl mr-2">⬅</span> ย้อนกลับ
      </button> */}
    </div>
  );
};

export default PatientInformation;
