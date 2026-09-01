import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import { Sensor } from "../../../types/sensor";
import { useSensorStore } from "../../../store/sensorStore";

interface SensorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialSensorData: Sensor;
  sensors: Sensor[];
}

const SensorDialog: React.FC<SensorDialogProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialSensorData,
  sensors,
}) => {
  const [sensorData, setSensorData] = useState<Sensor>(initialSensorData);
  const sensorStore = useSensorStore();

  const sensorTypeOptions = ["bed_sensor", "heart_rate", "spo2", "respiration"];

  useEffect(() => {
    if (isOpen) {
      setSensorData(initialSensorData);
    }
    console.log(initialSensorData);
  }, [isOpen]);

  const handleClose = () => {
    const clearSensorData: Sensor = {
      sensor_id: 0,
      sensor_type: "",
      sensor_status: false,
      history_value_sensor: [],
    };
    setSensorData(clearSensorData);
    onClose();
  };

  const [warningSameMacID, setWarningSameMacID] = useState(false);

  useEffect(() => {
    if (
      sensorData.sensor_mac_i &&
      sensorData.sensor_mac_ii &&
      sensorData.sensor_mac_i.trim() !== "" &&
      sensorData.sensor_mac_ii.trim() !== ""
    ) {
      setWarningSameMacID(sensorData.sensor_mac_i === sensorData.sensor_mac_ii);
    } else {
      setWarningSameMacID(false);
    }
  }, [sensorData.sensor_mac_i, sensorData.sensor_mac_ii]);

  const saveSensor = async () => {
    if (warningSameMacID) {
      alert("Mac Sensor I และ Mac Sensor II ต้องไม่ซ้ำกัน");
      return;
    }

    // ✅ เช็กซ้ำใน props.sensors
    const isDuplicate = sensors.some(
      (s) =>
        s.sensor_id !== sensorData.sensor_id && // กันกรณีแก้ไขของตัวเอง
        s.sensor_type === sensorData.sensor_type &&
        ((s.sensor_mac_i && s.sensor_mac_i === sensorData.sensor_mac_i) ||
          (s.sensor_mac_ii && s.sensor_mac_ii === sensorData.sensor_mac_ii))
    );

    if (isDuplicate) {
      alert("มีเซนเซอร์ประเภทเดียวกันที่ใช้ Mac นี้อยู่แล้ว");
      return;
    }

    // ✅ ผ่านแล้ว ค่อยบันทึก
    if (initialSensorData.sensor_id == 0) {
      if (!sensorData.sensor_unit) {
        sensorData.sensor_unit = "";
      }
      await sensorStore.addSensor(sensorData);
      onSaved();
      handleClose();
    } else {
      await sensorStore.editSensor(sensorData.sensor_id, sensorData);
      handleClose();
      onSaved();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-auto">
          {initialSensorData.sensor_id !== 0 || undefined ? (
            <h2 className="text-3xl font-semibold mb-4 text-center text-[#2E5361]">
              ตั้งค่าข้อมูลเซนเซอร์
            </h2>
          ) : (
            <h2 className="text-3xl font-semibold mb-4 text-center text-[#2E5361]">
              เพิ่มข้อมูลเซนเซอร์
            </h2>
          )}
          <div className="grid grid-cols-2 gap-4">
            {/* Mac Sensor I */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Mac Sensor I
              </label>
              <input
                id="mac1"
                type="text"
                value={sensorData.sensor_mac_i}
                placeholder="กรุณากรอก Mac Sensor I"
                onChange={(e) =>
                  setSensorData({ ...sensorData, sensor_mac_i: e.target.value })
                }
                className={`p-2 pl-3 border rounded-md w-full h-11 placeholder:text-gray-400 
      ${
        warningSameMacID
          ? "border-red-400 focus:border-red-500 focus:ring-red-300"
          : "border-gray-300 focus:border-[#5E8892] focus:ring-[#95BAC3]"
      }`}
              />
            </div>

            {/* Mac Sensor II */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Mac Sensor II
              </label>
              <input
                id="mac2"
                type="text"
                value={sensorData.sensor_mac_ii}
                placeholder="กรุณากรอก Mac Sensor II"
                onChange={(e) =>
                  setSensorData({
                    ...sensorData,
                    sensor_mac_ii: e.target.value,
                  })
                }
                className={`p-2 pl-3 border rounded-md w-full h-11 placeholder:text-gray-400 
      ${
        warningSameMacID
          ? "border-red-400 focus:border-red-500 focus:ring-red-300"
          : "border-gray-300 focus:border-[#5E8892] focus:ring-[#95BAC3]"
      }`}
              />

              {/* ✅ หมายเหตุ */}
              <p
                className={`mt-2 text-sm ${
                  warningSameMacID
                    ? "text-red-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                *Mac Sensor I และ Mac Sensor II ต้องไม่ซ้ำกัน
              </p>
            </div>

            {/* Sensor Name */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                ชื่อเซนเซอร์
              </label>
              <input
                id="sensor_name"
                type="text"
                value={sensorData.sensor_name}
                placeholder="กรุณากรอกชื่อเซนเซอร์"
                onChange={(e) =>
                  setSensorData({ ...sensorData, sensor_name: e.target.value })
                }
                className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 placeholder:text-gray-400"
              />
            </div>

            {/* Sensor Unit */}
            {/* <div>
              <label className="block mb-1 font-semibold text-gray-700">หน่วย</label>
              <input
                id="sensor_unit"
                type="text"
                value={sensorData.sensor_unit}
                placeholder="กรุณากรอกหน่วยของเซนเซอร์"
                onChange={(e) =>
                  setSensorData({ ...sensorData, sensor_unit: e.target.value })
                }
                className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 placeholder:text-gray-400"
              />
            </div> */}

            {/* ประเภท */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                ประเภทเซนเซอร์
              </label>
              <select
                id="sensorType"
                value={sensorData.sensor_type}
                className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                  sensorData.sensor_type ? "text-black" : "text-gray-400"
                }`}
                onChange={(e) =>
                  setSensorData({ ...sensorData, sensor_type: e.target.value })
                }
              >
                <option value="" disabled hidden>
                  กรุณาเลือกประเภทเซนเซอร์
                </option>
                {sensorTypeOptions.map((type) => (
                  <option key={type} value={type} className="text-black">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* สถานะ */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                สถานะ
              </label>
              <select
                id="status"
                value={sensorData.sensor_status ? "Active" : "Inactive"} // เลือกค่า Active หรือ Inactive ตามสถานะ
                className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer 
                  ${
                    sensorData.sensor_status
                      ? "text-green-600 border-green-500"
                      : "text-red-600 border-red-500"
                  }`}
                onChange={(e) => {
                  const status = e.target.value === "Active"; // ถ้าเลือก Active จะเป็น true
                  setSensorData({
                    ...sensorData,
                    sensor_status: status,
                  });
                }}
              >
                <option value="Inactive" className="text-red-600">
                  Inactive
                </option>
                <option value="Active" className="text-green-600">
                  Active
                </option>
              </select>
            </div>

            {/* หมายเหตุ */}
            {/* <div>
              {warningSameMacID && (
                <div className="text-red-600 text-sm col-span-2">
                  *Mac Sensor I และ II ต้องไม่ซ้ำกัน
                  มิฉะนั้นจะไม่สามารถบันทึกได้
                </div>
              )}
            </div> */}
          </div>
          <div className="flex items-center justify-between mt-6">
            <div>
              {initialSensorData.bed_id !== null ? (
                <label className="block mb-1 font-semibold text-gray-700">
                  สถานที่ติดตั้ง :{" "}
                  {initialSensorData.bed?.room?.floor?.building?.building_name}{" "}
                  {initialSensorData.bed?.room?.floor?.floor_name}{" "}
                  {initialSensorData.bed?.room?.room_name}{" "}
                  {initialSensorData.bed?.bed_name}
                </label>
              ) : (
                <label className="block mb-1 text-sm text-red-500 ">
                  ยังไม่ติดตั้งเซนเซอร์
                </label>
              )}
            </div>
            <div className="flex gap-4">
              <button
                id="btnCancel"
                onClick={handleClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
              >
                ยกเลิก
              </button>
              <button
                id="btnSave"
                className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                onClick={saveSensor}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SensorDialog;
