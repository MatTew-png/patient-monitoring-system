import React from "react";
import { Medical_History } from "../../../types/patient_medical_history";

type MedicalHistoryProps = {
  medicalHistoryList?: Medical_History[];
};

// ตัวอย่างข้อมูลจำลอง 10 แถว
const mockData: Medical_History[] = [
  {
    medical_history_id: 1,
    medical_history_inspect_date: "2023-05-01",
    medical_history_doctor: "นพ.สมชาย สุขใจ",
    medical_history_disease: "เบาหวาน",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Metformin",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "อาการควบคุมได้ดี",
  },
  {
    medical_history_id: 2,
    medical_history_inspect_date: "2023-06-12",
    medical_history_doctor: "พญ.วรรณา ใจดี",
    medical_history_disease: "ความดันโลหิตสูง",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Losartan",
    medical_history_drug_allergy: "แพ้ยาพาราเซตามอล",
    medical_history_treatment_result: "ลดลงอยู่ในเกณฑ์ปกติ",
  },
  {
    medical_history_id: 3,
    medical_history_inspect_date: "2023-07-20",
    medical_history_doctor: "นพ.ธนา สุริยันต์",
    medical_history_disease: "โรคหืด",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Salbutamol",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "อาการดีขึ้น ไม่มีหอบหืดเฉียบพลัน",
  },
  {
    medical_history_id: 4,
    medical_history_inspect_date: "2023-08-05",
    medical_history_doctor: "พญ.ศศิธร แสงทอง",
    medical_history_disease: "ไข้เลือดออก",
    medical_history_type: "แอดมิท",
    medical_history_medicine: "ให้สารน้ำและเฝ้าระวัง",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "หายดีแล้ว",
  },
  {
    medical_history_id: 5,
    medical_history_inspect_date: "2023-09-10",
    medical_history_doctor: "พญ.ลัดดาวัลย์ ศิริสุข",
    medical_history_disease: "ไข้หวัดใหญ่",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Oseltamivir",
    medical_history_drug_allergy: "แพ้เพนิซิลิน",
    medical_history_treatment_result: "อาการหายภายใน 5 วัน",
  },
  {
    medical_history_id: 6,
    medical_history_inspect_date: "2023-10-15",
    medical_history_doctor: "นพ.วิชัย เที่ยงธรรม",
    medical_history_disease: "กระเพาะอาหารอักเสบ",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Omeprazole",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "ดีขึ้น ไม่มีอาการปวด",
  },
  {
    medical_history_id: 7,
    medical_history_inspect_date: "2023-11-02",
    medical_history_doctor: "พญ.สุภาวดี แก้วกล้า",
    medical_history_disease: "โรคไตระยะเริ่มต้น",
    medical_history_type: "แนะนำดูแล",
    medical_history_medicine: "ลดเกลือในอาหาร",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "สามารถควบคุมได้",
  },
  {
    medical_history_id: 8,
    medical_history_inspect_date: "2023-12-21",
    medical_history_doctor: "นพ.ปกรณ์ ภักดี",
    medical_history_disease: "ไขมันในเลือดสูง",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Simvastatin",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "ระดับไขมันลดลง",
  },
  {
    medical_history_id: 9,
    medical_history_inspect_date: "2024-01-14",
    medical_history_doctor: "พญ.ปิยะธิดา ทองแท้",
    medical_history_disease: "ไมเกรน",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Ibuprofen",
    medical_history_drug_allergy: "แพ้แอสไพริน",
    medical_history_treatment_result: "ลดอาการปวดได้",
  },
  {
    medical_history_id: 10,
    medical_history_inspect_date: "2024-02-07",
    medical_history_doctor: "พญ.สุนันทา ศรีสง่า",
    medical_history_disease: "โรคผิวหนังอักเสบ",
    medical_history_type: "ให้ยา",
    medical_history_medicine: "Hydrocortisone cream",
    medical_history_drug_allergy: "ไม่มี",
    medical_history_treatment_result: "อาการหายภายใน 1 สัปดาห์",
  },
];

const MedicalHistory: React.FC<MedicalHistoryProps> = ({
  medicalHistoryList = mockData,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-100 overflow-y-auto">
        {" "}
        {/* 60 = ประมาณ 9 แถว */}
        <table className="min-w-full bg-white rounded-xl shadow text-base">
          <thead className="bg-[#2E5361] text-white sticky top-0">
            <tr>
              <th className="py-4 px-4 text-center">วันที่ตรวจ</th>
              <th className="py-4 px-4 text-center">โรค/ปัญหาสุขภาพ</th>
              <th className="py-4 px-4 text-center">แพทย์ผู้วินิจฉัย</th>
              <th className="py-4 px-4 text-center">ประเภทการรักษา</th>
              <th className="py-4 px-4 text-center">ยาที่ใช้/ยาประจำตัว</th>
              <th className="py-4 px-4 text-center">แพ้ยา/อาหาร</th>
              <th className="py-4 px-4 text-center">สถานะการรักษา/ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody>
            {medicalHistoryList.map((item) => (
              <tr
                key={item.medical_history_id}
                className="border-t bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
              >
                <td className="py-2 px-4 text-center">
                  {item.medical_history_inspect_date}
                </td>
                <td className="py-2 px-4 text-center">{item.medical_history_disease}</td>
                <td className="py-2 px-4 text-center">{item.medical_history_doctor}</td>
                <td className="py-2 px-4 text-center">{item.medical_history_type}</td>
                <td className="py-2 px-4 text-center">{item.medical_history_medicine}</td>
                <td className="py-2 px-4 text-center">
                  {item.medical_history_drug_allergy}
                </td>
                <td className="py-2 px-4 text-center">
                  {item.medical_history_treatment_result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalHistory;
