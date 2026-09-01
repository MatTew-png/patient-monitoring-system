import React, { useState } from "react";
import type { Sensor } from "../../types/sensor";
import { useSensorStore } from "../../store/sensorStore";
import { motion, AnimatePresence } from "framer-motion";
// import { useSensorStore } from "../../store/sensorStore";

interface AddSensorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSensor: (sensor: Sensor) => void;
}

const AddSensorDialog: React.FC<AddSensorDialogProps> = ({
  isOpen,
  onClose,
  onSelectSensor,
}) => {
  // const { loadAllSensorFree } = useSensorStore(); // ดึงฟังก์ชันโหลดเซนเซอร์
  const [searchI, setSearchI] = useState("");
  const [searchII, setSearchII] = useState("");
  const sensorStore = useSensorStore();

  // useEffect(() => {
  //   if (isOpen) {
  //     loadAllSensorFree().then((data: Sensor[]) => {
  //       setSensors(data); // เซ็ตค่าข้อมูลเซนเซอร์จาก store
  //     });
  //   }
  // }, [isOpen, loadAllSensorFree]);

  if (!isOpen) return null;

  const filteredSensors = sensorStore.sensorsFree.filter(
    (sensor) =>
      (sensor.sensor_mac_i?.toLowerCase() || "").includes(
        searchI.toLowerCase()
      ) &&
      (sensor.sensor_mac_ii?.toLowerCase() || "").includes(
        searchII.toLowerCase()
      )
  );

  // const sensors: Sensor[] = [
  //   {
  //     sensor_id: 1,
  //     sensor_type: "Respiration Sensor",
  //     sensor_status: true,
  //     sensor_mac_i: "C4:4F:33:0C:AC:49",
  //     sensor_mac_ii: "C4:4F:33:0C:AC:45",
  //     history_value_sensor: [],
  //     sensor_notification_config : [],
  //   },
  //   {
  //     sensor_id: 2,
  //     sensor_type: "Heart Rate Sensor",
  //     sensor_status: false,
  //     sensor_mac_i: "C4:4F:33:0C:AC:50",
  //     sensor_mac_ii: "C4:4F:33:0C:AC:51",
  //     history_value_sensor: [],
  //     sensor_notification_config : [],
  //   },
  // ];

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
    {/* <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-transparent z-40"> */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[80vh] overflow-auto ">
        <h2 className="text-2xl font-semibold mb-4">เพิ่มเซนเซอร์</h2>

        <div className="flex gap-4 mb-4">
          <input
            id="searchSensor1"
            type="text"
            placeholder="ค้นหาเซนเซอร์ I"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            value={searchI}
            onChange={(e) => setSearchI(e.target.value)}
          />
          <input
            id="searchSensor2"
            type="text"
            placeholder="ค้นหาเซนเซอร์ II"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            value={searchII}
            onChange={(e) => setSearchII(e.target.value)}
          />
        </div>

        <div className="overflow-auto max-h-[50vh]">
          <table className="w-full border-collapse border border-gray-300 text-lg">
            <thead>
              <tr className="bg-[#95BAC3] text-center">
                <th className="border p-3">ลำดับ</th>
                <th className="border p-3">Mac Sensor I</th>
                <th className="border p-3">Mac Sensor II</th>
                <th className="border p-3">ประเภทเซนเซอร์</th>
                <th className="border p-3">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map((sensor, index) => (
                <tr
                  key={sensor.sensor_id}
                  className="odd:bg-white even:bg-gray-100"
                >
                  <td className="border p-3 text-center">{index + 1}</td>
                  <td className="border p-3 text-center">
                    {sensor.sensor_mac_i}
                  </td>
                  <td className="border p-3 text-center">
                    {sensor.sensor_mac_ii}
                  </td>
                  <td className="border p-3">{sensor.sensor_type}</td>
                  <td className="border p-3 text-center">
                    <button
                      className="px-4 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer transition-transform duration-300 hover:scale-110"
                      onClick={() => onSelectSensor(sensor)}
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

export default AddSensorDialog;
