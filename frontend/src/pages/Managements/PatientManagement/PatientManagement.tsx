// src/pages/PatientManagement.tsx
import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
// import { mdiMagnify, mdiPlus } from "@mdi/js";
import { mdiMagnify } from "@mdi/js";
import { Patient } from "../../../types/patient";
import DeletePatientDialog from "../../../components/Managements/Patient/DeletePatientDialog";
import PatientDialog from "../../../components/Managements/Patient/PatientDialog";
import { usePatientStore } from "../../../store/patientStore";
import { Bed } from "../../../types/bed";
import { bedService } from "../../../services/bedService";
//import { useNavigate } from "react-router-dom";

const PatientManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const patientStore = usePatientStore();
  const [patientData, setpatientData] = useState<Patient[]>([]);
  const [bedData, setBedData] = useState<Bed[]>([]);
  const [isClicked] = useState(false);
  //const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient>({
    patient_id: 0,
    patient_name: "",
    patient_age: 0,
    patient_gender: "",
    patient_dob: "",
    patient_disease: "",
    patient_status: "",
    patient_date_in: "",
    patient_bloodtype: "",
  });

  const filteredPatients = patientData.filter((p) =>
    p.patient_name.toLowerCase().includes(search.toLowerCase())
  );

  function openAddForm(): void {
    setSelectedPatient({
      patient_id: 0,
      patient_name: "",
      patient_age: 0,
      patient_gender: "",
      patient_dob: "",
      patient_disease: "",
      patient_status: "",
      patient_date_in: "",
      patient_bloodtype: "",
    });
    setIsFormOpen(true);
  }
  const fetchAllData = async () => {
    const resPatients = await patientStore.getPatients();
    setpatientData(resPatients);
    setBedData(await bedService.loadBedActivatedAll());
    console.log("ตรงนี้ไหมนะ 91",patientStore.getPatientInformation(91))
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openEditForm = (patient: Patient): void => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  {
    /*const patientInformationPage = (patient_id: number) => {
    navigate(`${patient_id}/patient-information`);
  };*/
  }

  const [patientIdDeleteTarget, setPatientIdDeleteTarget] = useState<number>(0);
  const openDeleteDialog = (patient_id: number) => {
    setIsDeleteDialogOpen(true);
    setPatientIdDeleteTarget(patient_id);
  };
  const handleDeletePatient = async (patient_id: number) => {
    await patientStore.deletePatient(patient_id);
    await refreshPateintData();
    setIsDeleteDialogOpen(false);
  };

  const refreshPateintData = async () => {
    await fetchAllData();
  };

  // pagination state และ config
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const paginatedPatients = filteredPatients.slice(
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
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#2E5361]">ข้อมูลผู้ป่วย</h1>
      </div>

      <div className="flex space-x-4 justify-between mb-8">
        <div className="relative flex-auto">
          <input
            id="searchPatient"
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered border-2 border-gray-400 rounded-lg p-2 pr-10 bg-white w-full inset-shadow"
          />
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <PatientDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialPatientData={selectedPatient}
          onSubmit={fetchAllData}
        />

        <button
          id="btnAddPatient"
          className={`flex items-center gap-2 px-6 py-3 w-45 h-12 text-base bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md transform transition-transform duration-200 hover:-translate-y-1 hover:scale-105 cursor-pointer ${
            isClicked ? "animate-jump" : ""
          }`}
          onClick={openAddForm}
        >
          {/* <Icon path={mdiPlus} size={1} /> */}
          <img
            src="/src/assets/btnManagement/AddUser.png"
            alt="abbPatient"
            className="w-5"
          />
          <span>เพิ่มผู้ป่วยใหม่</span>
        </button>
      </div>

      <table className="w-full border-collapse shadow-md">
        <thead className="bg-[#B7D6DE] h-16 font-bold text-center">
          <tr>
            <th className="p-2">รหัสผู้ป่วย</th>
            <th className="p-2">ชื่อ-นามสกุล</th>
            <th className="p-2">อายุ</th>
            <th className="p-2">เพศ</th>
            <th className="p-2">หมู่เลือด</th>
            <th className="p-2">โรคประจำตัว</th>
            <th className="p-2">สถานะ</th>
            <th className="p-2">วันที่เข้าโรงพยาบาล</th>
            <th className="p-2">อาคาร</th>
            <th className="p-2">ห้อง</th>
            <th className="p-2">หมายเลขเตียง</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedPatients.map((p, index) => {
            const bedInfo = bedData.find((b) => b.patient_id === p.patient_id);

            return (
              <tr
                key={p.patient_id}
                className="text-center bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
              >
                <td className="p-2 h-16 py-4 text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_name ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_age ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_gender ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_bloodtype ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_disease ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_status ?? "-"}
                </td>
                <td className="p-2 h-16 py-4 text-center">
                  {p.patient_date_in ?? "-"}
                </td>

                {/* ✅ เพิ่มข้อมูลอาคาร ห้อง เตียง */}
                <td className="p-2 h-16">
                  {bedInfo?.room?.floor?.building.building_name ?? "-"}
                </td>
                <td className="p-2 h-16">{bedInfo?.room?.room_name ?? "-"}</td>
                <td className="p-2 h-16">{bedInfo?.bed_name ?? "-"}</td>

                <td className="p-2 h-16 py-4 text-center flex justify-center gap-2">
                  {/*<button
                    id="detail"
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                    onClick={() => patientInformationPage(p.patient_id ?? 0)}
                  >
                    <img src="/src/assets/review.png" alt="review" />
                  </button>*/}
                  <button
                    id="edit"
                    onClick={() => openEditForm(p)}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/edit.png" alt="edit" />
                  </button>
                  <button
                    id="delete"
                    onClick={() => openDeleteDialog(p.patient_id ?? 0)}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/delete.png" alt="delete" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination แบบ dynamic */}
      <div className="flex justify-end mt-6">
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

      <DeletePatientDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={() => {
          handleDeletePatient(patientIdDeleteTarget);
          setIsDeleteDialogOpen(false);
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default PatientManagement;
