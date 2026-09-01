import React, { useEffect, useState } from "react";
import BedCard from "../components/Home/bedCard";
import { useBedStore } from "../store/bedStore";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { Bed } from "../types/bed";
import { useNotificationStore } from "../store/notificationStore";
import { useNavigate } from "react-router-dom";
import { SensorIdList } from "../types/sensor";
import { sensorWebsocket } from "../hooks/useSensorWebSocket";

const Home: React.FC = () => {
  const { beds, loadBedsByPage, countBed, currentPage, setCurrentPage } =
    useBedStore();
  const [search, setSearch] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [filteredBeds, setFilteredBeds] = useState<Bed[]>([]);
  const [backupFilteredBedsSearch, setBackupFilteredBedsSearch] = useState<
    Bed[]
  >([]);
  const [unpackedBedDatas, setUnpackedBedDatas] = useState<Bed[] | undefined>();
  const [totalPages, setTotalPages] = useState<number>(2);
  const navigate = useNavigate();

  const sensorIdArray: SensorIdList = { sensors_id: [] };

  useEffect(() => {
    const fetchPage = async () => {
      const data = await loadBedsByPage(currentPage);
      setUnpackedBedDatas(data);
    };
    fetchPage();
  }, [currentPage]);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await countBed();
      setTotalPages(Math.ceil(count / 6));
    };
    fetchCount();
  }, []);

  useEffect(() => {
    if (!unpackedBedDatas) return;

    sensorIdArray.sensors_id = [];

    unpackedBedDatas.forEach((bedItem) => {
      bedItem.sensors.forEach((sensor) => {
        sensorIdArray.sensors_id.push(sensor.sensor_id);
      });
    });

    const ws = sensorWebsocket(
      sensorIdArray,
      setFilteredBeds,
      setBackupFilteredBedsSearch,
      search
    );

    return () => {
      ws.close();
    };
  }, [unpackedBedDatas, search]);

  const {
    loadEmergencyNotAccepted,
    loadSosNotAccepted,
    loadEmergencyNotSuccessed,
    loadSosNotSuccessed,
  } = useNotificationStore();

  useEffect(() => {
    loadEmergencyNotAccepted();
    loadEmergencyNotSuccessed();
    loadSosNotAccepted();
    loadSosNotSuccessed();
  }, []);

  useEffect(() => {
    const newFiltered = backupFilteredBedsSearch.filter(
      (bed: Bed) =>
        bed.bed_activated &&
        (!search ||
          (bed.patient?.patient_name?.toLowerCase() || "").includes(
            search.toLowerCase()
          ))
    );
    setFilteredBeds(newFiltered);
  }, [search, beds]);

  const handleAddPatientClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    navigate("/add-patient-home");
  };

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
    <div id="homePage" style={{ padding: "20px", backgroundColor: "#e7f0f3" }}>
      <h2 className="text-[#2E5361] text-4xl font-bold mb-4 pl-4 py-2">
        รายการเตียงผู้ป่วย
      </h2>

      <div className="flex space-x-4 justify-between mb-4">
        <div className="relative flex-auto pl-4 ">
          <input
            id="search"
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย"
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

        <button
          id="btnAdd"
          className={`flex items-center gap-2 px-4 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 ${
            isClicked ? "animate-jump" : ""
          }`}
          onClick={handleAddPatientClick}
        >
          <img
            src="/src/assets/btnaddpatienthome.png"
            alt="addPatient"
            className="w-6"
          />
          <span>เพิ่มผู้ป่วย</span>
        </button>
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          id="currentPage"
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 rounded-xl bg-[#95BAC3] text-white hover:bg-[#5E8892] shadow-sm cursor-pointer ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
        >
          &laquo; หน้าแรก
        </button>

        {getPageNumbers().map((page) => (
          <button
            id="pageNum"
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-xl cursor-pointer ${
              currentPage === page
                ? "bg-[#5E8892] text-white shadow-lg"
                : "bg-white text-black border border-gray-300"
            } hover:bg-[#5E8892] hover:text-white`}
          >
            {page}
          </button>
        ))}

        <button
          id="lastPage"
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded-xl bg-[#95BAC3] text-white hover:bg-[#5E8892] shadow-sm cursor-pointer${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
        >
          หน้าสุดท้าย &raquo;
        </button>
      </div>

      <div
        id="bedList"
        style={{ display: "flex", flexWrap: "wrap" }}
        className="justify-center p-4 gap-3 gap-x-7"
      >
        {filteredBeds.map((bed) => (
          <BedCard key={bed.bed_id} bed={bed} />
        ))}
      </div>
    </div>
  );
};

export default Home;
