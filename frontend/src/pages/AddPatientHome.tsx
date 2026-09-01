import React, { useEffect, useState, useMemo } from "react";
import { Bed } from "../types/bed";
import { Building } from "../types/building";
import { useBedStore } from "../store/bedStore";
import { useNavigate } from "react-router-dom";
import { useWardStore } from "../store/wardStore";
import { Ward } from "../types/ward";

const AddPatientHome: React.FC = () => {
  const [buildingOptions, setBuildingOptions] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [bedsData, setBedsData] = useState<Bed[]>([]);
  const [wardNames, setWardNames] = useState<Record<number, string>>({});
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<number | "">("");
  const [sortAsc, setSortAsc] = useState(true);

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const bedStore = useBedStore();
  const wardStore = useWardStore();
  const navigate = useNavigate();
  const [$locations, setLocations] = useState<Building[]>([]);

  useEffect(() => {
    const fetchBedsFreeData = async () => {
      const res = await bedStore.getBedsFreeByWard();
      setBedsData(res);

      const wardMap: Record<number, string> = {};
      await Promise.all(
        res.map(async (bed) => {
          if (bed.room.ward_id) {
            const ward = await wardStore.getWardById(bed.room.ward_id);
            if (ward) {
              wardMap[bed.room.ward_id] = ward.ward_name;
            }
          }
        })
      );
      setWardNames(wardMap);
    };

    const fetchLocationsData = async () => {
      const res = await bedStore.getLocations();
      setLocations(res);
    };

    const fetchWards = async () => {
      const wards = await wardStore.getWards();
      setWardOptions(wards);
    };

    fetchBedsFreeData();
    fetchLocationsData();
    fetchWards();
  }, []);

  // เมื่อข้อมูลสถานที่โหลดแล้วให้สร้างตัวเลือก "อาคาร"
  useEffect(() => {
    const buildings: string[] = [""];
    $locations.forEach((item) => {
      buildings.push(item.building_name);
    });
    setBuildingOptions(buildings);
  }, [$locations]);

  // เมื่อเลือกอาคารใหม่ รีเซ็ตชั้นและห้อง และสร้างตัวเลือก "ชั้น"
  useEffect(() => {
    setSelectedFloor("");
    setSelectedRoom("");
    const floors: string[] = [""];
    $locations.forEach((item) => {
      if (item.building_name === selectedBuilding) {
        item.floor?.forEach((f) => {
          floors.push(f.floor_name);
        });
      }
    });
    setFloorOptions(floors);
  }, [selectedBuilding]);

  // เมื่อเลือกชั้นใหม่ รีเซ็ตห้อง และสร้างตัวเลือก "ห้อง"
  useEffect(() => {
    setSelectedRoom("");
    const rooms: string[] = [""];
    $locations.forEach((item) => {
      if (item.building_name === selectedBuilding) {
        item.floor?.forEach((f) => {
          if (f.floor_name === selectedFloor) {
            f.room?.forEach((r) => {
              rooms.push(r.room_name);
            });
          }
        });
      }
    });
    setRoomOptions(rooms);
  }, [selectedFloor]);

  // ✅ filter + search + sort
  const filteredBeds = useMemo(() => {
    const filtered = bedsData.filter((bed) => {
      const matchBuilding =
        selectedBuilding === "" ||
        bed.room.floor?.building.building_name === selectedBuilding;
      const matchFloor =
        selectedFloor === "" || bed.room.floor?.floor_name === selectedFloor;
      const matchRoom =
        selectedRoom === "" || bed.room.room_name === selectedRoom;
      const matchWard =
        selectedWard === "" || bed.room.ward_id === selectedWard;

      return matchBuilding && matchFloor && matchRoom && matchWard;
    });

    // ✅ sort ตาม ward
    return [...filtered].sort((a, b) => {
      const wardA = a.room.ward_id ? wardNames[a.room.ward_id] || "" : "";
      const wardB = b.room.ward_id ? wardNames[b.room.ward_id] || "" : "";
      if (wardA < wardB) return sortAsc ? -1 : 1;
      if (wardA > wardB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [
    bedsData,
    selectedBuilding,
    selectedFloor,
    selectedRoom,
    selectedWard,
    wardNames,
    sortAsc,
  ]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage);
  const paginatedBeds = filteredBeds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
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
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-6">
        รายการเตียงผู้ป่วย
      </h1>

      {/* ฟิลเตอร์ */}
      <div className="flex gap-4 mb-6 items-end">
        {/* อาคาร */}
        <div className="flex flex-col">
          <label htmlFor="building">ค้นหาเตียงว่าง</label>
          <select
            id="building"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="border border-gray-400 rounded-lg p-2"
          >
            <option value="">เลือกอาคาร</option>
            {buildingOptions.slice(1).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* ชั้น */}
        <div className="flex flex-col">
          <label htmlFor="floor">&nbsp;</label>
          <select
            id="floor"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="border border-gray-400 rounded-lg p-2"
            disabled={!selectedBuilding}
          >
            <option value="">เลือกชั้น</option>
            {floorOptions.slice(1).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* ห้อง */}
        <div className="flex flex-col">
          <label htmlFor="room">&nbsp;</label>
          <select
            id="room"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="border border-gray-400 rounded-lg p-2"
            disabled={!selectedFloor}
          >
            <option value="">เลือกห้อง</option>
            {roomOptions.slice(1).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* วอร์ด */}
        <div className="flex flex-col ml-auto">
          <label htmlFor="ward">&nbsp;</label>
          <select
            id="ward"
            value={selectedWard}
            onChange={(e) =>
              setSelectedWard(e.target.value ? Number(e.target.value) : "")
            }
            className="border border-gray-400 rounded-lg p-2"
          >
            <option value="">เลือกวอร์ด</option>
            {wardOptions.map((ward) => (
              <option key={ward.ward_id} value={ward.ward_id}>
                {ward.ward_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ตารางเตียง */}
      <table className="w-full border-collapse">
        <thead className="bg-[#95BAC3] text-black h-12 text-center">
          <tr>
            <th className="p-2">อาคาร</th>
            <th className="p-2">ชั้น</th>
            <th className="p-2">ห้อง</th>
            <th className="p-2">หมายเลขเตียง</th>
            {/* ✅ sort ward */}
            <th
              className="p-2 cursor-pointer hover:bg-[#7aa3ab] transition"
              onClick={() => setSortAsc(!sortAsc)}
            >
              วอร์ด {sortAsc ? "▲" : "▼"}
            </th>
            <th className="p-2">ดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBeds.map((bed) => (
            <tr
              key={bed.bed_id}
              className="text-center h-12 even:bg-[#D1DFE5] odd:bg-white"
            >
              <td>{bed.room.floor?.building.building_name}</td>
              <td>{bed.room.floor?.floor_name}</td>
              <td>{bed.room.room_name}</td>
              <td>{bed.bed_name}</td>
              <td>
                {bed.room.ward_id ? wardNames[bed.room.ward_id] || "-" : "-"}
              </td>
              <td>
                <button
                  id="select"
                  className="bg-[#95BAC3] text-white px-4 py-1 rounded-md hover:bg-[#5E8892] shadow-md transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  onClick={() => navigate(`/bed-config/${bed.bed_id}`)}
                >
                  เลือก
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(1)}
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892]"
            disabled={currentPage === 1}
          >
            &laquo; หน้าแรก
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
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
            onClick={() => changePage(totalPages)}
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892]"
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย &raquo;
          </button>
        </div>
      </div>

      {/* ปุ่มยกเลิก */}
      <div className="mt-6 text-right">
        <button
          id="btnCancel"
          className="bg-[#95BAC3] text-white px-6 py-2 rounded-xl hover:bg-[#5E8892] shadow-lg transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
          onClick={() => navigate(-1)}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default AddPatientHome;
