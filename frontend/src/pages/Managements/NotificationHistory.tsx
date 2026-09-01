import React, { useEffect, useState } from "react";
import { Sensor } from "../../types/sensor";
import { useSensorStore } from "../../store/sensorStore";
import DateRangePicker from "../../components/Managements/NotificationsHistory/DateRangePicker";
import { useNotificationStore } from "../../store/notificationStore";
import { Notification } from "../../types/notification";
import { BellRing } from "lucide-react";

const NotificationHistory: React.FC = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [selectedZone, setSelectedZone] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const sensorStore = useSensorStore();
  const itemsPerPage = 10;
  const notificationStore = useNotificationStore();

  const fetchSensors = async () => {
    try {
      const data = await sensorStore.getSensors();
      // console.log("✅ Sensors fetched:", data);
      setSensors(data);
    } catch (error) {
      console.error("❌ Error fetching sensors:", error);
    }
  };

  const setLocalDate = async () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    setStartDate(formattedDate);
    setEndDate(formattedDate);
    fetchData(formattedDate, formattedDate);
  };

  const fetchData = async (start_date: string, end_date: string) => {
    const fetchData = await notificationStore.getNotificationsByDate(
      start_date,
      end_date
    );
    setData(fetchData);
  };

  useEffect(() => {
    fetchSensors();
    setLocalDate();
  }, []);

  //ถ้าจะ test ว่ากรองได้จริงไหม sensor id bed = 1 hert rate id = 7
  const sensorOptions = [
    { label: "เซนเซอร์ทั้งหมด", value: "all" },
    { label: "Bed Sensor", value: "bed_sensor" },
    { label: "SpO2 Sensor", value: "spo2" },
    { label: "Respiration Sensor", value: "respiration" },
    { label: "Heart Rate Sensor", value: "heart_rate" },
  ];

  const filteredData = data
    .filter((h) => {
      if (selectedZone === "all") return true;

      const matchedSensor = sensors.find(
        (s) => s.sensor_id === h.sensor_notifications_config.sensor_id
      );
      return matchedSensor?.sensor_type === selectedZone;
    })
    .sort((a, b) =>
      (b.notification_createdate ?? "").localeCompare(
        a.notification_createdate ?? ""
      )
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  function formatDateTime(datetimeString: string) {
    const dt = new Date(datetimeString);

    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0"); // เดือนนับจาก 0
    const yyyy = dt.getFullYear();

    const hh = String(dt.getHours()).padStart(2, "0");
    const min = String(dt.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  // ทำงานเมื่อเปลี่ยนวันที่
  const handleDateChange = (range: { startDate: string; endDate: string }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    fetchData(range.startDate, range.endDate);
  };

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-4">
        ประวัติการแจ้งเตือน
      </h1>

      <div className="flex gap-4 flex-wrap md:flex-nowrap items-center mb-6">
        <label className="mb-1 text-xl text-gray-700 font-medium">
          เลือกช่วงวันที่
        </label>
        {/* date picker */}
        <DateRangePicker
          id="date-range-picker"
          data-cy="date-range-picker"
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        <select
          id="selectSensor"
          className="select select-bordered border-2 border-gray-400 rounded-lg bg-white p-2 w-full md:w-auto ml-auto"
          value={selectedZone}
          onChange={(e) => {
            setSelectedZone(e.target.value);
            setCurrentPage(1);
          }}
        >
          {sensorOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="w-full border-collapse shadow-md">
        <thead className="bg-[#B7D6DE] h-16 font-bold text-center">
          <tr>
            <th className="p-2 text-left pl-6">การแจ้งเตือน</th>
            <th className="p-2">วันที่/เวลา</th>
            {/* <th className="p-2">รายละเอียด</th> */}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((h) => (
            <tr
              key={h.notification_id}
              className="text-center bg-white shadow-sm even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
            >
              <td className="p-2 h-16 text-left pl-6">
                {/* แสดงไอคอนตามประเภทการแจ้งเตือน */}
                {h.notification_category === "Emergency" && (
                  <BellRing
                    id="bell-icon"
                    className="inline-block mr-2 w-6 h-6 text-yellow-500 fill-yellow-500 transition-all drop-shadow-lg"
                  />
                )}
                {h.notification_category === "SOS" && (
                  <span
                    id="sos-label"
                    className="inline-flex items-center justify-center mr-2 bg-red-700 text-xs text-white w-8 h-8 rounded-full shadow-md transition-all"
                  >
                    SOS
                  </span>
                )}
                {
                  h.sensor_notifications_config
                    .sensor_notifications_config_event
                }{" "}
                {"ที่ "}
                {
                  h.log_bed_patient_sensor?.bed?.room.floor?.building
                    .building_name
                }{" "}
                {h.log_bed_patient_sensor?.bed?.room.floor?.floor_name}{" "}
                {h.log_bed_patient_sensor?.bed?.room.room_name}{" "}
                {h.log_bed_patient_sensor?.bed?.bed_name}
              </td>

              <td className="p-2 h-16">
                {formatDateTime(h.notification_createdate || "")}
              </td>
              {/*
              <td className="p-2 h-16 py-4 text-center flex justify-center gap-2">
                <button
                  id="detail"
                  className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                >
                  <img src="/src/assets/review.png" alt="review" />
                </button>
              </td>
              */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center gap-2">
          <button
            id="currentPage"
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 bg-[#95BAC3] rounded-xl hover:bg-[#5E8892] text-white cursor-pointer"
            disabled={currentPage === 1}
          >
            &laquo; หน้าแรก
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              id="pageNum"
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded-xl cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#5E8892] text-white shadow-lg"
                  : "bg-white text-black"
              } hover:bg-[#5E8892]`}
            >
              {pageNum}
            </button>
          ))}

          <button
            id="lastPage"
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1 bg-[#95BAC3] rounded-xl hover:bg-[#5E8892] text-white cursor-pointer"
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory;
