// src/pages/SensorManagement.tsx
import React, { useEffect, useState } from "react";
import { Sensor } from "../../types/sensor";
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import SensorDialog from "../../components/Managements/Sensor/SensorDialog";
import { useSensorStore } from "../../store/sensorStore";
import DeleteSensorDialog from "../../components/Managements/Sensor/DeleteSensorDialog";

const SensorManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClicked] = useState(false);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [initialSensorData, setInitialSensorData] = useState<Sensor>({
    sensor_id: 0,
    sensor_type: "",
    sensor_status: false,
    history_value_sensors: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const sensorStore = useSensorStore();

  // กรอง sensor ตามคำค้น
  const filteredSensors = sensors.filter((sensor) => {
    const keyword = search.toLowerCase();
    return (
      sensor.sensor_mac_i?.toLowerCase().includes(keyword) ||
      sensor.sensor_mac_ii?.toLowerCase().includes(keyword) ||
      sensor.sensor_type?.toLowerCase().includes(keyword)
    );
  });

  const refreshGetSensor = async () => {
    await fetchSensors();
  };

  const fetchSensors = async () => {
    const data = await sensorStore.getSensors();
    setSensors(data);
    // console.log(data);
  };
  // ดึงข้อมูล sensor เมื่อโหลดหน้า
  useEffect(() => {
    fetchSensors();
  }, []);

  const openDialogForAdd = () => {
    setIsDialogOpen(true);
    const clearSensorData: Sensor = {
      sensor_id: 0,
      sensor_type: "",
      sensor_status: false,
      history_value_sensor: [],
      bed_id: null,
      bed: {
        room: {
          floor: {
            building: {
              building_name: "",
            },
            floor_name: "",
          },
          room_name: "",
        },
        bed_id: 0,
        bed_name: "",
        bed_activated: false,
        sensors: [],
      },
    };
    setInitialSensorData(clearSensorData);
  };

  const openDialogForEdit = (sensor: Sensor) => {
    setInitialSensorData(sensor);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (sensor: Sensor) => {
    const isAttached = !!sensor.bed_id || !!sensor.bed?.bed_id;
    if (isAttached) return; // ป้องกันไม่ให้เปิดถ้าผูกติดกับเตียง
    setInitialSensorData(sensor);
    setIsDeleteDialogOpen(true);
  };

  // pagination state และ config
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSensors.length / itemsPerPage);

  // ตัดข้อมูล sensor เฉพาะหน้าปัจจุบัน
  const currentSensors = filteredSensors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // เปลี่ยนหน้าถัดไปหรือหน้าก่อนหน้า
  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // คำนวณ page numbers ที่จะแสดงแบบ dynamic 5 หน้า
  const getPageNumbers = (): number[] => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let startPage = currentPage - half;
    let endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(maxVisible, totalPages);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#2E5361]">จัดการเซนเซอร์</h1>
      </div>

      <div className="flex space-x-4 justify-between mb-8">
        {/* ช่องค้นหา */}
        <div className="relative flex-auto">
          <input
            id="searchSensor"
            type="text"
            placeholder="ค้นหาเซนเซอร์"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered border-2 border-solid border-gray-400 rounded-lg p-2 pr-10 bg-white w-full inset-shadow"
          />
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        {/* Dialog เพิ่มเซนเซอร์ */}
        <SensorDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          initialSensorData={initialSensorData}
          onSaved={refreshGetSensor}
          sensors={sensors}
        />

        <button
          id="btnAddSensor"
          className={`flex items-center gap-2 px-4 py-2 w-45 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md transform transition-transform duration-200 hover:-translate-y-1 hover:scale-105 cursor-pointer ${
            isClicked ? "animate-jump" : ""
          }`}
          onClick={openDialogForAdd}
        >
          {/* <Icon path={mdiPlus} size={1} /> */}
          <img
            src="/src/assets/btnManagement/AddSensor.png"
            alt="abbSensor"
            className="w-7"
          />
          <span>เพิ่มเซนเซอร์ใหม่</span>
        </button>
      </div>

      <table className="w-full border-collapse shadow-md">
        <thead className="bg-[#B7D6DE] h-16 py-4 font-bold">
          <tr>
            <th className="p-2">ลำดับ</th>
            <th className="p-2">Mac Sensor I</th>
            <th className="p-2">Mac Sensor II</th>
            <th className="p-2">อาคาร</th>
            <th className="p-2">ห้อง</th>
            <th className="p-2">หมายเลขเตียง</th>
            <th className="p-2">ประเภทเซนเซอร์</th>
            <th className="p-2">หน่วย</th>
            <th className="p-2 text-center">สถานะ</th>
            <th className="p-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {currentSensors.map((sensor, index) => {
            const isAttached = !!sensor.bed_id || !!sensor.bed?.bed_id;
            return (
              <tr
                key={sensor.sensor_id}
                className="bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
              >
                <td className="p-2 h-16 py-4 text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.sensor_mac_i || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.sensor_mac_ii || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.bed?.room?.floor?.building?.building_name || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.bed?.room?.room_name || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.bed?.bed_name || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.sensor_type || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {sensor.sensor_unit || "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  <span
                    className={
                      sensor.sensor_status
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    {sensor.sensor_status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2 h-16 py-4 text-center flex justify-center gap-2">
                  <button
                    id="edit"
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                    onClick={() => openDialogForEdit(sensor)}
                  >
                    <img src="/src/assets/edit.png" alt="edit" />
                  </button>

                  <button
                    id="delete"
                    onClick={() => {
                      if (!isAttached) openDeleteDialog(sensor);
                    }}
                    className={`mx-1 w-7 h-7 transform transition-transform duration-200 ${
                      isAttached
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:-translate-y-1 hover:scale-110"
                    }`}
                    aria-disabled={isAttached}
                    title={
                      isAttached
                        ? "ผูกติดกับเตียง: ไม่สามารถลบได้"
                        : "ลบเซนเซอร์"
                    }
                    disabled={isAttached}
                  >
                    <img
                      src={
                        isAttached
                          ? "/src/assets/delete.png"
                          : "/src/assets/delete.png"
                      }
                      alt="delete"
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-2">
          <button
            id="currentPage"
            onClick={() => changePage(1)}
            className="px-3 py-1 bg-[#95BAC3] rounded-xl hover:bg-[#5E8892] text-white cursor-pointer"
            disabled={currentPage === 1}
          >
            &laquo; หน้าแรก
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              id="pageNum"
              key={pageNum}
              onClick={() => changePage(pageNum)}
              className={`px-3 py-1 rounded-xl cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#5E8892] text-white shadow-lg"
                  : "bg-white text-black inset-shadow"
              } hover:bg-[#5E8892]`}
            >
              {pageNum}
            </button>
          ))}

          <button
            id="lastPage"
            onClick={() => changePage(totalPages)}
            className="px-3 py-1 bg-[#95BAC3] rounded-xl hover:bg-[#5E8892] text-white cursor-pointer"
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย &raquo;
          </button>
        </div>
      </div>
      <DeleteSensorDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        initialSensorData={initialSensorData}
        onConfirm={refreshGetSensor}
      />
    </div>
  );
};

export default SensorManagement;
