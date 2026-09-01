import { Bed } from "../types/bed";
import { Patient } from "../types/patient";
import { Sensor } from "../types/sensor";
import { Building } from "../types/building";
import { Ward } from "../types/ward";
import { Room } from "../types/room";
import { Notification } from "../types/notification";
import { User } from "../types/user";

export const MOCK_WARD: Ward = {
  ward_id: 1,
  ward_name: "วอร์ดอายุรกรรมโรคหัวใจและหลอดเลือด (Cardiology Ward 4B)",
  floor_id: 4,
};

export const MOCK_ROOMS: Room[] = [
  { room_id: 101, room_name: "ห้อง 401 (ผู้ป่วยวิกฤต/ติดตามใกล้ชิด)", ward_id: 1, ward: MOCK_WARD },
  { room_id: 102, room_name: "ห้อง 402 (ผู้ป่วยพักฟื้น)", ward_id: 1, ward: MOCK_WARD },
  { room_id: 103, room_name: "ห้อง 403 (ห้องพิเศษเดี่ยว)", ward_id: 1, ward: MOCK_WARD },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    patient_id: 1,
    patient_name: "นายสมชาย พัฒนกิจ",
    patient_age: 68,
    patient_gender: "ชาย",
    patient_dob: "1958-04-12",
    patient_disease: "กล้ามเนื้อหัวใจขาดเลือด (CAD), ความดันโลหิตสูง",
    patient_status: "เข้ารับการรักษา",
    patient_date_in: "2026-08-28",
    patient_bloodtype: "O+",
    image_path: "/src/assets/default.png",
  },
  {
    patient_id: 2,
    patient_name: "นางมาลี ทองคำ",
    patient_age: 74,
    patient_gender: "หญิง",
    patient_dob: "1952-11-05",
    patient_disease: "ภาวะหัวใจล้มเหลว (CHF), เสี่ยงต่อการพลัดตกหกล้ม",
    patient_status: "เฝ้าระวังพิเศษ",
    patient_date_in: "2026-08-29",
    patient_bloodtype: "B+",
    image_path: "/src/assets/default.png",
  },
  {
    patient_id: 3,
    patient_name: "นายวิชัย เกียรติสุข",
    patient_age: 59,
    patient_gender: "ชาย",
    patient_dob: "1967-02-18",
    patient_disease: "หัวใจเต้นผิดจังหวะ (Atrial Fibrillation)",
    patient_status: "เข้ารับการรักษา",
    patient_date_in: "2026-08-30",
    patient_bloodtype: "A+",
    image_path: "/src/assets/default.png",
  },
  {
    patient_id: 4,
    patient_name: "นางสมศรี ประเสริฐสุข",
    patient_age: 81,
    patient_gender: "หญิง",
    patient_dob: "1945-09-24",
    patient_disease: "หลังผ่าตัดข้อสะโพก, อัมพฤกษ์ซีกซ้าย",
    patient_status: "เฝ้าระวังพิเศษ",
    patient_date_in: "2026-08-31",
    patient_bloodtype: "AB+",
    image_path: "/src/assets/default.png",
  },
  {
    patient_id: 5,
    patient_name: "นายเอกชัย นามสมมุติ",
    patient_age: 62,
    patient_gender: "ชาย",
    patient_dob: "1964-07-14",
    patient_disease: "ถุงลมโป่งพอง (COPD), ภาวะขาดออกซิเจนเรื้อรัง",
    patient_status: "เข้ารับการรักษา",
    patient_date_in: "2026-09-01",
    patient_bloodtype: "O-",
    image_path: "/src/assets/default.png",
  },
  {
    patient_id: 6,
    patient_name: "นางกานดา รักษ์ดี",
    patient_age: 65,
    patient_gender: "หญิง",
    patient_dob: "1961-03-30",
    patient_disease: "โรคไตวายเรื้อรังระยะ 4, เบาหวานชนิดที่ 2",
    patient_status: "เข้ารับการรักษา",
    patient_date_in: "2026-09-01",
    patient_bloodtype: "B-",
    image_path: "/src/assets/default.png",
  },
];

export const createMockSensors = (bedId: number): Sensor[] => [
  {
    sensor_id: bedId * 10 + 1,
    bed_id: bedId,
    sensor_name: "อัตราการเต้นของหัวใจ (Heart Rate)",
    sensor_type: "heart_rate",
    sensor_status: true,
    sensor_unit: "BPM",
    sensor_mac_i: `AA:BB:CC:DD:0${bedId}:01`,
    history_value_sensor: Array.from({ length: 12 }, (_, i) => ({
      history_value_sensor_id: i + 1,
      sensor_id: bedId * 10 + 1,
      sensor_value: (72 + Math.sin(i) * 5 + (bedId % 3)).toFixed(0),
      timestamp: `2026-09-01T${String(10 + i).padStart(2, "0")}:00:00Z`,
    })),
  },
  {
    sensor_id: bedId * 10 + 2,
    bed_id: bedId,
    sensor_name: "ระดับออกซิเจนในเลือด (SpO2)",
    sensor_type: "spo2",
    sensor_status: true,
    sensor_unit: "%",
    sensor_mac_i: `AA:BB:CC:DD:0${bedId}:02`,
    history_value_sensor: Array.from({ length: 12 }, (_, i) => ({
      history_value_sensor_id: i + 10,
      sensor_id: bedId * 10 + 2,
      sensor_value: (98 + (i % 2)).toFixed(0),
      timestamp: `2026-09-01T${String(10 + i).padStart(2, "0")}:00:00Z`,
    })),
  },
  {
    sensor_id: bedId * 10 + 3,
    bed_id: bedId,
    sensor_name: "อัตราการหายใจ (Respiration)",
    sensor_type: "respiration",
    sensor_status: true,
    sensor_unit: "RPM",
    sensor_mac_i: `AA:BB:CC:DD:0${bedId}:03`,
    history_value_sensor: Array.from({ length: 12 }, (_, i) => ({
      history_value_sensor_id: i + 20,
      sensor_id: bedId * 10 + 3,
      sensor_value: (16 + (i % 3)).toFixed(0),
      timestamp: `2026-09-01T${String(10 + i).padStart(2, "0")}:00:00Z`,
    })),
  },
  {
    sensor_id: bedId * 10 + 4,
    bed_id: bedId,
    sensor_name: "เซนเซอร์ตรวจจับการเคลื่อนไหวและการล้ม (Fall & Motion Sensor)",
    sensor_type: "fall_detection",
    sensor_status: true,
    sensor_unit: "State",
    sensor_mac_i: `AA:BB:CC:DD:0${bedId}:04`,
    history_value_sensor: [
      { history_value_sensor_id: 101, sensor_id: bedId * 10 + 4, sensor_value: "On Bed (Safe)", timestamp: "2026-09-01T15:00:00Z" },
    ],
  },
];

export const MOCK_BEDS: Bed[] = [
  {
    bed_id: 1,
    bed_name: "เตียง 01 (Bed 01)",
    bed_activated: true,
    room: MOCK_ROOMS[0],
    room_id: 101,
    patient_id: 1,
    patient: MOCK_PATIENTS[0],
    sensors: createMockSensors(1),
    selectedShowSensorId: [11, 12, 13],
  },
  {
    bed_id: 2,
    bed_name: "เตียง 02 (Bed 02 - เฝ้าระวัง)",
    bed_activated: true,
    room: MOCK_ROOMS[0],
    room_id: 101,
    patient_id: 2,
    patient: MOCK_PATIENTS[1],
    sensors: createMockSensors(2),
    selectedShowSensorId: [21, 22, 23],
  },
  {
    bed_id: 3,
    bed_name: "เตียง 03 (Bed 03)",
    bed_activated: true,
    room: MOCK_ROOMS[1],
    room_id: 102,
    patient_id: 3,
    patient: MOCK_PATIENTS[2],
    sensors: createMockSensors(3),
    selectedShowSensorId: [31, 32, 33],
  },
  {
    bed_id: 4,
    bed_name: "เตียง 04 (Bed 04 - เฝ้าระวัง)",
    bed_activated: true,
    room: MOCK_ROOMS[1],
    room_id: 102,
    patient_id: 4,
    patient: MOCK_PATIENTS[3],
    sensors: createMockSensors(4),
    selectedShowSensorId: [41, 42, 43],
  },
  {
    bed_id: 5,
    bed_name: "เตียง 05 (Bed 05)",
    bed_activated: true,
    room: MOCK_ROOMS[2],
    room_id: 103,
    patient_id: 5,
    patient: MOCK_PATIENTS[4],
    sensors: createMockSensors(5),
    selectedShowSensorId: [51, 52, 53],
  },
  {
    bed_id: 6,
    bed_name: "เตียง 06 (Bed 06)",
    bed_activated: true,
    room: MOCK_ROOMS[2],
    room_id: 103,
    patient_id: 6,
    patient: MOCK_PATIENTS[5],
    sensors: createMockSensors(6),
    selectedShowSensorId: [61, 62, 63],
  },
];

export const MOCK_BUILDINGS: Building[] = [
  {
    building_id: 1,
    building_name: "อาคารเฉลิมพระเกียรติ 80 พรรษา",
    floors: [
      {
        floor_id: 4,
        floor_number: 4,
        building_id: 1,
        wards: [MOCK_WARD],
      },
    ],
  },
];

export const MOCK_USERS: User[] = [
  {
    user_id: 1,
    username: "mattew.admin",
    name: "ภัทรพล จันทร์สง่า (MatTew)",
    position: "Admin",
    role: "Admin",
    ward_id: 1,
    ward: MOCK_WARD,
    tel: "081-234-5678",
    email: "65160078@go.buu.ac.th",
  },
  {
    user_id: 2,
    username: "dr.sudaporn",
    name: "พญ. สุดาพร วัฒนกุล",
    position: "Doctor",
    role: "Doctor",
    ward_id: 1,
    ward: MOCK_WARD,
    tel: "082-987-6543",
    email: "sudaporn.w@hospital.go.th",
  },
  {
    user_id: 3,
    username: "nurse.waraporn",
    name: "พว. วราภรณ์ สุขใจ",
    position: "Nurse",
    role: "Nurse",
    ward_id: 1,
    ward: MOCK_WARD,
    tel: "083-456-7890",
    email: "waraporn.s@hospital.go.th",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notification_id: 1,
    sensor_notifications_config_id: 1,
    log_bed_patient_sensor_id: 101,
    notification_category: "Emergency",
    notification_accepted: false,
    notification_successed: false,
    notification_createdate: new Date().toISOString(),
    sensor_notifications_config: {
      sensor_notifications_config_id: 1,
      sensor_id: 24,
      sensor_notifications_config_name: "ตรวจพบการเคลื่อนไหวผิดปกติ (เสี่ยงล้ม)",
      sensor_notifications_config_unit: "State",
      sensor_notifications_config_status: true,
      sensor_notifications_config_type: "Emergency",
    },
  },
  {
    notification_id: 2,
    sensor_notifications_config_id: 2,
    log_bed_patient_sensor_id: 102,
    notification_category: "SOS",
    notification_accepted: false,
    notification_successed: false,
    notification_createdate: new Date(Date.now() - 15 * 60000).toISOString(),
    sensor_notifications_config: {
      sensor_notifications_config_id: 2,
      sensor_id: 31,
      sensor_notifications_config_name: "อัตราการเต้นของหัวใจสูงผิดปกติ (>100 bpm)",
      sensor_notifications_config_unit: "BPM",
      sensor_notifications_config_status: true,
      sensor_notifications_config_type: "SOS",
    },
  },
];
