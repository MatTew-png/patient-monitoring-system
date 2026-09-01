import React from "react";
import { Sensor } from "../../types/sensor";
import { Bed } from "../../types/bed";

interface SensorAndBedInfoProps {
  sensorList?: Sensor[];
  selectedSensor?: Sensor;
  bed?: Bed;
  onSensorChange: (sensorId: number) => void;
}

const SensorAndBedInfo: React.FC<SensorAndBedInfoProps> = ({
  sensorList,
  selectedSensor,
  bed,
  onSensorChange,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      {/* Dropdown สำหรับเลือกเซนเซอร์ */}
      <label htmlFor="sensor-select" className="sr-only">
        เลือกเซนเซอร์
      </label>
      <select
        id="sensor-select"
        className="px-4 py-2 bg-white border rounded-lg inset-shadow cursor-pointer"
        value={selectedSensor?.sensor_id}
        onChange={(e) => onSensorChange(parseInt(e.target.value))}
      >
        {sensorList?.map((sensor) => (
          <option key={sensor.sensor_id} value={sensor.sensor_id}>
            {sensor.sensor_name}
          </option>
        ))}
      </select>

      {/* ปุ่มแสดงข้อมูลเตียง */}
      <button
        className="px-4 py-2 bg-white border rounded-lg inset-shadow"
        id="buildingName"
      >
        {bed?.room?.floor?.building?.building_name}
      </button>
      <button
        className="px-4 py-2 bg-white border rounded-lg inset-shadow"
        id="floorName"
      >
        {bed?.room?.floor?.floor_name}
      </button>
      <button
        className="px-4 py-2 bg-white border rounded-lg inset-shadow"
        id="roomName"
      >
        {bed?.room?.room_name}
      </button>
      <button
        className="px-4 py-2 bg-white border rounded-lg inset-shadow"
        id="bedName"
      >
        {bed?.bed_name}
      </button>
    </div>
  );
};

export default SensorAndBedInfo;
