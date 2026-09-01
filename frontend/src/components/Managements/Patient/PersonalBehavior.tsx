import React from "react";
import { Personal_Behavior } from "../../../types/patient_personal_behavior";

type PersonalBehaviorProps = {
  patientBehaviorList?: Personal_Behavior[];
};

// ตัวอย่างข้อมูลจำลอง 10 แถว
const mockData: Personal_Behavior[] = [
  {
    personal_behavior_id: 1,
    personal_behavior_date: "2025-05-01",
    personal_behavior_wake_time: "06:30",
    personal_behavior_duration: "7h 30m",
    personal_behavior_position: "นอนหงาย",
    personal_behavior_sleep_interruption_count: 1,
    personal_behavior_fall_asleep_time: "22:30",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "10m",
  },
  {
    personal_behavior_id: 2,
    personal_behavior_date: "2025-05-02",
    personal_behavior_wake_time: "07:00",
    personal_behavior_duration: "8h",
    personal_behavior_position: "นอนตะแคง",
    personal_behavior_sleep_interruption_count: 2,
    personal_behavior_fall_asleep_time: "23:00",
    personal_behavior_noise_disruption_count: 1,
    personal_behavior_out_of_bed_duration: "15m",
  },
  {
    personal_behavior_id: 3,
    personal_behavior_date: "2025-05-03",
    personal_behavior_wake_time: "06:45",
    personal_behavior_duration: "7h",
    personal_behavior_position: "นอนคว่ำ",
    personal_behavior_sleep_interruption_count: 3,
    personal_behavior_fall_asleep_time: "23:15",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "20m",
  },
  {
    personal_behavior_id: 4,
    personal_behavior_date: "2025-05-04",
    personal_behavior_wake_time: "06:50",
    personal_behavior_duration: "6h 50m",
    personal_behavior_position: "นอนหงาย",
    personal_behavior_sleep_interruption_count: 1,
    personal_behavior_fall_asleep_time: "22:45",
    personal_behavior_noise_disruption_count: 1,
    personal_behavior_out_of_bed_duration: "25m",
  },
  {
    personal_behavior_id: 5,
    personal_behavior_date: "2025-05-05",
    personal_behavior_wake_time: "07:15",
    personal_behavior_duration: "8h 15m",
    personal_behavior_position: "นอนตะแคง",
    personal_behavior_sleep_interruption_count: 0,
    personal_behavior_fall_asleep_time: "22:15",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "5m",
  },
  {
    personal_behavior_id: 6,
    personal_behavior_date: "2025-05-06",
    personal_behavior_wake_time: "07:05",
    personal_behavior_duration: "7h 45m",
    personal_behavior_position: "นอนหงาย",
    personal_behavior_sleep_interruption_count: 2,
    personal_behavior_fall_asleep_time: "23:00",
    personal_behavior_noise_disruption_count: 1,
    personal_behavior_out_of_bed_duration: "12m",
  },
  {
    personal_behavior_id: 7,
    personal_behavior_date: "2025-05-07",
    personal_behavior_wake_time: "06:40",
    personal_behavior_duration: "6h 40m",
    personal_behavior_position: "นอนคว่ำ",
    personal_behavior_sleep_interruption_count: 3,
    personal_behavior_fall_asleep_time: "23:20",
    personal_behavior_noise_disruption_count: 2,
    personal_behavior_out_of_bed_duration: "30m",
  },
  {
    personal_behavior_id: 8,
    personal_behavior_date: "2025-05-08",
    personal_behavior_wake_time: "06:55",
    personal_behavior_duration: "7h 10m",
    personal_behavior_position: "นอนตะแคง",
    personal_behavior_sleep_interruption_count: 1,
    personal_behavior_fall_asleep_time: "22:40",
    personal_behavior_noise_disruption_count: 1,
    personal_behavior_out_of_bed_duration: "18m",
  },
  {
    personal_behavior_id: 9,
    personal_behavior_date: "2025-05-09",
    personal_behavior_wake_time: "07:10",
    personal_behavior_duration: "7h 50m",
    personal_behavior_position: "นอนหงาย",
    personal_behavior_sleep_interruption_count: 2,
    personal_behavior_fall_asleep_time: "22:50",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "8m",
  },
  {
    personal_behavior_id: 10,
    personal_behavior_date: "2025-05-10",
    personal_behavior_wake_time: "06:35",
    personal_behavior_duration: "7h 20m",
    personal_behavior_position: "นอนตะแคง",
    personal_behavior_sleep_interruption_count: 0,
    personal_behavior_fall_asleep_time: "22:20",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "6m",
  },
  {
    personal_behavior_id: 11,
    personal_behavior_date: "2025-05-01",
    personal_behavior_wake_time: "06:30",
    personal_behavior_duration: "7h 30m",
    personal_behavior_position: "นอนหงาย",
    personal_behavior_sleep_interruption_count: 1,
    personal_behavior_fall_asleep_time: "22:30",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "10m",
  },
  {
    personal_behavior_id: 12,
    personal_behavior_date: "2025-05-02",
    personal_behavior_wake_time: "07:00",
    personal_behavior_duration: "8h",
    personal_behavior_position: "นอนตะแคง",
    personal_behavior_sleep_interruption_count: 2,
    personal_behavior_fall_asleep_time: "23:00",
    personal_behavior_noise_disruption_count: 1,
    personal_behavior_out_of_bed_duration: "15m",
  },
  {
    personal_behavior_id: 13,
    personal_behavior_date: "2025-05-03",
    personal_behavior_wake_time: "06:45",
    personal_behavior_duration: "7h",
    personal_behavior_position: "นอนคว่ำ",
    personal_behavior_sleep_interruption_count: 3,
    personal_behavior_fall_asleep_time: "23:15",
    personal_behavior_noise_disruption_count: 0,
    personal_behavior_out_of_bed_duration: "20m",
  },
];

const PersonalBehavior: React.FC<PersonalBehaviorProps> = ({
  patientBehaviorList = mockData,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-100 overflow-y-auto">
        {" "}
        {/* 60 = ประมาณ 9 แถว */}
        <table className="min-w-full bg-white rounded-xl text-base">
          <thead className="bg-[#2E5361] text-white sticky top-0">
            <tr>
              <th className="py-4 px-4 text-center">วันที่</th>
              <th className="py-4 px-4 text-center">เวลาตื่น</th>
              <th className="py-4 px-4 text-center">เวลาหลับ</th>
              <th className="py-4 px-4 text-center">ระยะเวลาการนอน</th>
              <th className="py-4 px-4 text-center">ท่าทางขณะนอน</th>
              <th className="py-4 px-4 text-center">จำนวนครั้งที่ตื่น</th>
              <th className="py-4 px-4 text-center">เสียงรบกวน</th>
              <th className="py-4 px-4 text-center">อยู่นอกห้องพัก (รวม)</th>
            </tr>
          </thead>
          <tbody>
            {patientBehaviorList.map((item) => (
              <tr key={item.personal_behavior_id} 
                  className="border-t bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]">
                <td className="py-2 px-4 text-center">{item.personal_behavior_date}</td>
                <td className="py-2 px-4 text-center">
                  {item.personal_behavior_wake_time}
                </td>
                <td className="py-2 px-4 text-center">
                  {item.personal_behavior_fall_asleep_time}
                </td>
                <td className="py-2 px-4 text-center">{item.personal_behavior_duration}</td>
                <td className="py-2 px-4 text-center">{item.personal_behavior_position}</td>
                <td className="py-2 px-4 text-center">
                  {item.personal_behavior_sleep_interruption_count}
                </td>
                <td className="py-2 px-4 text-center">
                  {item.personal_behavior_noise_disruption_count}
                </td>
                <td className="py-2 px-4 text-center">
                  {item.personal_behavior_out_of_bed_duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonalBehavior;
