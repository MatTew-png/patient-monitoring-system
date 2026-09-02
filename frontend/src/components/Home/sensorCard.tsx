import React, { useEffect, useState } from "react";
import { Sensor } from "../../types/sensor";
import SensorListDialog from "./sensorListDialog";
import { IoCloseCircle } from "react-icons/io5";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Patient } from "../../types/patient";
import { useBedStore } from "../../store/bedStore";
import heart from "../../assets/sensorType/heart.png";
import spo2 from "../../assets/sensorType/spo2.png";
import respiration from "../../assets/sensorType/respiration.png";
import rate1 from "../../assets/sensorType/rate1.png";
import rate2 from "../../assets/sensorType/rate2.png";
import rate3 from "../../assets/sensorType/rate3.png";
import { useSensorStore } from "../../store/sensorStore";
// import { sensorWebSocketService } from "../../services/sensor.websocket";

interface Props {
  sensor?: Sensor;
  sensorList: Sensor[];
  updateSensorSet: (sensor: Sensor) => void;
  patient?: Patient;
  bed_id: number;
}

const SensorCard: React.FC<Props> = ({
  sensor,
  sensorList,
  updateSensorSet,
  patient,
  bed_id,
}) => {
  //store
  const bedStore = useBedStore();
  const sensorStore = useSensorStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | undefined>(
    sensor
  );
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setSelectedSensor(sensor);
    setIsHovered(false);

    // const fetchSensorData = async () => {
    //   if (!sensor?.sensor_id) return;

    //   try {
    //     // โหลดข้อมูลจาก API ก่อน
    //     const updatedSensor = await sensorStore.loadValueSensor(
    //       sensor.sensor_id
    //     );
    //     setSelectedSensor(updatedSensor);
    //   } catch (error) {
    //     console.error("Error fetching sensor data:", error);
    //   }
    // };

    // fetchSensorData(); // โหลดข้อมูลจาก API ครั้งแรก
  }, [sensor, sensorStore]); // 🚀 เช็คว่า sensor หรือ sensorStore เปลี่ยนแปลง

  // useEffect(() => {
  //   if (!sensor?.sensor_id) return;

  //   // WebSocket callback function
  //   const handleMessage = (updatedSensor: Sensor) => {
  //     setSelectedSensor(updatedSensor);
  //   };

  //   // เชื่อมต่อ WebSocket เมื่อ sensor เปลี่ยนแปลง
  //   sensorWebSocketService.connect(sensor.sensor_id, handleMessage);

  //   return () => {
  //     // cleanup เมื่อ component ถูก unmount หรือ sensor เปลี่ยน
  //     sensorWebSocketService.disconnect(sensor.sensor_id);
  //   };
  // }, [sensor]); // ใช้ sensor เป็น dependency เพื่อเชื่อมต่อ WebSocket ใหม่เมื่อ sensor เปลี่ยน

  const toggleDialog = () => {
    if (!patient || selectedSensor) return;
    setIsDialogOpen(!isDialogOpen);
  };

  const handleSensorSelect = (sensor: Sensor) => {
    if (!patient) return;
    setIsHovered(false);
    setIsDialogOpen(false);
    updateSensorSet(sensor);
  };

  const handleRemoveSensor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!patient || !selectedSensor) return;
    updateSensorSet(selectedSensor);
    setSelectedSensor(undefined);
    setIsHovered(false);
    bedStore.saveRemoveShowSensorId(bed_id, selectedSensor.sensor_id);
  };

  // กำหนดไอคอนและภาพคลื่นตามประเภทเซ็นเซอร์
  const sensorIcons: { [key: string]: string } = {
    heart_rate: heart,
    spo2: spo2,
    respiration: respiration,
  };

  const sensorWaves: { [key: string]: string } = {
    heart_rate: rate1,
    spo2: rate2,
    respiration: rate3,
  };

  const sensorType = selectedSensor?.sensor_type || "Default";
  const iconPath = sensorIcons[sensorType];
  const wavePath = sensorWaves[sensorType];

  // useEffect(() => {
  //   console.log(sensorList);
  // }, [sensorList]);

  return (
    <div
      id="sensorCard"
      className={`relative border border-black rounded-lg w-[150px] h-1/3 p-1.5 flex flex-col justify-between transition-all overflow-hidden duration-250 shadow-[0_3px_10px_rgb(0,0,0,0.2)]
    bg-[#B7D6DE]
    ${
      sensor?.history_value_sensor[0]?.notification_level === 2
        ? "bg-yellow-400"
        : sensor?.history_value_sensor[0]?.notification_level === 3
        ? "bg-red-300"
        : ""
    }`}
      onClick={toggleDialog}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && selectedSensor && patient && (
        <button
          className="absolute top-1 right-1 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-md hover:bg-red-700 transition-all duration-150 cursor-pointer z-10"
          onClick={handleRemoveSensor}
          aria-label="Remove Sensor"
          id="btnRemove"
        >
          <IoCloseCircle />
        </button>
      )}
      {selectedSensor ? (
        <div className="flex flex-col h-full justify-between">
          <p className="text-xs font-semibold text-gray-800 truncate leading-tight" title={selectedSensor.sensor_name || selectedSensor.sensor_type}>
            {selectedSensor.sensor_name || selectedSensor.sensor_type}
          </p>
          <div className="flex items-center justify-between px-0.5 my-0.5">
            <img
              src={iconPath}
              alt={sensorType}
              className="w-5 h-5 flex-shrink-0 object-contain"
              id="sensorImg"
            />
            <div className="flex-1 text-center px-1">
              <span className="text-2xl font-bold text-gray-900 leading-none">
                {selectedSensor.history_value_sensor?.slice(-1)[0]
                  ?.history_value_sensor_value || "-"}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-700 flex-shrink-0" id="unit">
              {selectedSensor.sensor_unit || "bpm"}
            </span>
          </div>
          <div className="flex justify-center items-center h-6 overflow-hidden">
            <img
              src={wavePath}
              alt={`${sensorType} Wave`}
              className="w-16 h-7 object-contain"
              id="sensorWave"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center cursor-pointer h-full">
          <i
            id="addSensor"
            className="bi bi-patch-plus-fill text-3xl text-[#2E5361]"
          ></i>
        </div>
      )}
      {isDialogOpen && patient && (
        <SensorListDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          sensorList={sensorList}
          onSelect={handleSensorSelect}
          bed_id={bed_id}
        />
      )}
    </div>
  );
};

export default SensorCard;
