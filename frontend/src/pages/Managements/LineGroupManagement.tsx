import React, { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { useLineStore } from "../../store/lineStore";
import LineGroupDialog from "../../components/Managements/LineGroup/LineGroup";
import DeleteLineGroupDialog from "../../components/Managements/LineGroup/DeleteLineGroupDialog";
import AddLineDialog from "../../components/Managements/LineGroup/AddLineDialog"; // import AddLineDialog
import { useWardStore } from "../../store/wardStore";
import { SelectedDeleteGroup, SelectedGroup } from "../../types/line_group";

const LineGroupManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDeleteGroup, setSelectedDeleteGroup] = useState<SelectedDeleteGroup | null>(null);

  // AddLineDialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // store
  const { lineGroups, getLineGroups } = useLineStore();
  const { getWardById } = useWardStore();
  const [wardNames, setWardNames] = useState<Record<number, string>>({});

  // fetch data function
  const fetchData = async () => {
    const groups = await getLineGroups();
    const wardMap: Record<number, string> = {};
    for (const g of groups) {
      if (g.ward_id) {
        const ward = await getWardById(g.ward_id);
        if (ward) {
          wardMap[g.ward_id] = ward.ward_name;
        }
      }
    }
    setWardNames(wardMap);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // filter & pagination
  const filteredGroups = lineGroups.filter((g) =>
    g.line_group_name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
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

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-4">การแจ้งเตือนไลน์</h1>

      {/* Search + Add */}
      <div className="flex space-x-4 justify-between mb-6">
        <div className="relative flex-auto">
          <input
            id="searchLineGroup"
            type="text"
            placeholder="ค้นหากลุ่มไลน์"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered border-2 border-gray-400 rounded-lg p-2 pr-10 bg-white w-full inset-shadow"
          />
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <button
          id="btnAddLineGroup"
          className="flex items-center gap-2 px-4 py-2 w-45 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
          onClick={() => setOpenAddDialog(true)} // เปิด AddLineDialog
        >
          <img src="/src/assets/btnManagement/AddLine.png" alt="abbBed" className="w-7 filter brightness-20" />
          <span>เพิ่มกลุ่มไลน์ใหม่</span>
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse shadow-md">
        <thead className="bg-[#B7D6DE] h-14 font-bold text-center">
          <tr>
            <th className="p-2">ลำดับ</th>
            <th className="p-2">Group ID</th>
            <th className="p-2">ชื่อกลุ่มไลน์</th>
            <th className="p-2">วอร์ด</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedGroups.map((group, index) => (
            <tr
              key={group.line_group_id}
              className="text-center bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
            >
              <td className="p-2 h-14">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-2 h-14">{group.line_group_id}</td>
              <td className="p-2 h-14">{group.line_group_name}</td>
              <td className="p-2 h-14">{group.ward_id ? wardNames[group.ward_id] ?? "กำลังโหลด..." : "-"}</td>
              <td className="p-2 h-16 py-4 pr-7 flex justify-end gap-2 text-right">
                <button
                  id="edit"
                  className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  onClick={() => {
                    setSelectedGroup({
                      groupId: group.line_group_id,
                      groupName: group.line_group_name,
                      wardId: group.ward_id ? Number(group.ward_id) : 0,
                    });
                    setOpenDialog(true); // เปิด LineGroupDialog สำหรับแก้ไข
                  }}
                >
                  <img src="/src/assets/edit.png" alt="edit" />
                </button>
                <button
                  id="delete"
                  className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  onClick={() => {
                    setSelectedDeleteGroup({
                      line_group_id: group.line_group_id,
                      line_group_name: group.line_group_name,
                    });
                    setOpenDeleteDialog(true);
                  }}
                >
                  <img src="/src/assets/delete.png" alt="delete" />
                </button>
              </td>
            </tr>
          ))}
          {paginatedGroups.length === 0 && (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500 italic">
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center gap-2">
          <button
            id="currentPage"
            onClick={() => changePage(1)}
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
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
                currentPage === pageNum ? "bg-[#5E8892] text-white shadow-lg" : "bg-white text-black inset-shadow"
              } hover:bg-[#5E8892]`}
            >
              {pageNum}
            </button>
          ))}

          <button
            id="lastPage"
            onClick={() => changePage(totalPages)}
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย &raquo;
          </button>
        </div>
      </div>

      {/* Dialog */}
      {/* Add new group */}
      <AddLineDialog
        isOpen={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        qrCodeUrl="\src\assets\LineQrCode.png" 
        onSubmit={fetchData}
      />

      {/* Edit group */}
      <LineGroupDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        initialData={selectedGroup}
        onSaveSuccess={fetchData} // refresh หลัง save
      />

      {/* Delete group */}
      <DeleteLineGroupDialog
        isOpen={openDeleteDialog}
        onCancel={() => setOpenDeleteDialog(false)}
        initialGroupData={selectedDeleteGroup}
        onDeleteSuccess={fetchData} // refresh หลัง delete
      />
    </div>
  );
};

export default LineGroupManagement;
