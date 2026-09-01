import React from "react";
import { Bed } from "../../types/bed";
import { Patient } from "../../types/patient";
import { mdiAccountCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { buildUrl } from "../../services/http";

interface Props {
  bed: Bed;
  patientData?: Patient;
  patientInformationData?: Patient;
}

const PatientInfoCard: React.FC<Props> = ({
  bed,
  patientData,
  patientInformationData,
}) => {
  const patient = bed.patient;

  // ✅ สร้างลิงก์รูปผู้ป่วย
  const imageUrl = patient?.image_path
    ? buildUrl(patient.image_path) ?? ""
    : patientData?.image_path
    ? buildUrl(patientData.image_path) ?? ""
    : null;

  return (
    <section
      id="PatientInfo"
      className="col-span-2 row-span-2 bg-gradient-to-r from-[#A1B5BC] via-[#D1DFE5] to-[#e4ecef] border-2 border-gray-300 p-4 rounded-lg shadow"
    >
      <h2 className="text-xl font-bold mb-4 text-[#2E5361]">ข้อมูลผู้ป่วย</h2>

      {patient || patientData ? (
        <div className="flex items-start space-x-6">
          {/* รูปผู้ป่วย */}
          <div className="flex-shrink-0 w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow-inner">
            {imageUrl ? (
              <img
                id="Img"
                src={imageUrl}
                alt="Patient"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon path={mdiAccountCircle} size={2.5} color="#4B5563" />
            )}
          </div>

          {/* ข้อมูลผู้ป่วย */}
{/* ข้อมูลผู้ป่วย */}
<div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-base text-gray-800">
  <p>
    <strong>รหัสผู้ป่วย:</strong>{" "}
    {patient?.patient_id || patientData?.patient_id}
  </p>
  <p>
    <strong>ชื่อ-นามสกุล:</strong>{" "}
    {patient?.patient_name || patientData?.patient_name}
  </p>
  <p>
    <strong>อายุ:</strong>{" "}
    {patient?.patient_age || patientData?.patient_age}
  </p>
  <p>
    <strong>เพศ:</strong>{" "}
    {patient?.patient_gender || patientData?.patient_gender}
  </p>
  <p>
    <strong>วันเกิด:</strong>{" "}
    {patient?.patient_dob || patientData?.patient_dob}
  </p>
  <p>
    <strong>หมู่เลือด:</strong>{" "}
    {patient?.patient_bloodtype || patientData?.patient_bloodtype}
  </p>
  <p>
    <strong>โรคที่ป่วย:</strong>{" "}
    {patient?.patient_disease || patientData?.patient_disease}
  </p>
  <p>
    <strong>อาคาร:</strong>{" "}
    {bed.room?.floor?.building?.building_name ||
      patientInformationData?.bed?.room?.floor?.building
        ?.building_name ||
      "-"}
  </p>
  <p>
    <strong>ห้อง:</strong>{" "}
    {bed.room?.room_name ||
      patientInformationData?.bed?.room?.room_name ||
      "-"}
  </p>
  <p>
    <strong>วอร์ด:</strong>{" "}
    {bed.room?.ward?.ward_name ||
      patientInformationData?.bed?.room?.ward?.ward_name ||
      "-"}
  </p>
  <p>
    <strong>เตียง:</strong>{" "}
    {bed.bed_name || patientInformationData?.bed?.bed_name}
  </p>
</div>

        </div>
      ) : (
        <p className="text-red-500">ไม่มีผู้ป่วยในเตียงนี้</p>
      )}
    </section>
  );
};

export default PatientInfoCard;
