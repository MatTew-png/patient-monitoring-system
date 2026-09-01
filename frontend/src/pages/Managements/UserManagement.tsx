// src/pages/UserManagement.tsx
import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
// import { mdiMagnify, mdiAccountPlus } from "@mdi/js";
import { User } from "../../types/user";
import { useUserStore } from "../../store/UserStore";
import DeleteUserDialog from "../../components/Managements/User/DeleteUserDialog";
import UserDialog from "../../components/Managements/User/UserDialog";

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>({
    user_id: 0,
    user_name: "",
    user_position: "",
    user_username: "",
    user_password: "",
    ward_id: undefined,
  });
  const itemsPerPage = 10;
  const userStore = useUserStore();
  const userData = userStore.users;

  const openAddUserDialog = () => {
    setSelectedUser({
      user_id: 0,
      user_name: "",
      user_position: "",
      user_username: "",
      user_password: "",
      ward_id: undefined,
    });
    setUserDialogOpen(true);
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setUserDialogOpen(false);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const filteredUsers = userData.filter((user) =>
    user.user_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
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

  const refreshGetUsers = async () => {
    await userStore.getUsers();
  };

  useEffect(() => {
    userStore.getUsers();
  }, []);

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-4">ผู้ใช้งานระบบ</h1>

      <div className="flex space-x-4 justify-between mb-6">
        <div className="relative flex-auto">
          <input
            id="searchUser"
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้งานระบบ"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered border-2 border-gray-400 rounded-lg p-2 pr-10 bg-white inset-shadow w-full"
          />
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <button
          id="btnAddUser"
          onClick={openAddUserDialog}
          className="flex items-center gap-2 px-4 py-2 w-45 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
        >
          <img
            src="/src/assets/btnManagement/AddUser.png"
            alt="addUser"
            className="w-5"
          />
          <span>เพิ่มผู้ใช้งานระบบ</span>
        </button>
      </div>

      <table className="w-full border-collapse shadow-md">
        <thead className="bg-[#B7D6DE] h-14 font-bold text-center">
          <tr>
            <th className="p-2">ลำดับ</th>
            <th className="p-2">Username</th>
            <th className="p-2">ชื่อผู้ใช้งาน</th>
            <th className="p-2">ตำแหน่ง</th>
            <th className="p-2">วอร์ด</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <tr
              key={user.user_id}
              className="text-center bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
            >
              <td className="p-2 h-14">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="p-2 h-14">{user.user_username}</td>
              <td className="p-2 h-14">{user.user_name}</td>
              <td className="p-2 h-14">{user.user_position}</td>
              <td className="p-2 h-14">{user.ward?.ward_name || "-"}</td>
              <td className="p-2 h-16 py-4 pr-7 flex justify-end gap-2 text-right">
                <button
                  id="edit"
                  onClick={() => openEditUserDialog(user)}
                  className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                >
                  <img src="/src/assets/edit.png" alt="edit" />
                </button>
                <button
                  id="delete"
                  onClick={() => openDeleteDialog(user)}
                  className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                >
                  <img src="/src/assets/delete.png" alt="delete" />
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
            id="currentPage"
            onClick={() => changePage(1)}
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892]"
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
            className="px-3 py-1 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892]"
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย &raquo;
          </button>
        </div>
        <DeleteUserDialog
          isOpen={deleteDialogOpen}
          onCancel={closeDeleteDialog}
          initialUserData={selectedUser}
          onConfirm={refreshGetUsers}
        />
        <UserDialog
          isOpen={userDialogOpen}
          user={selectedUser}
          onCancel={closeUserDialog}
          onSaved={refreshGetUsers} // ✅ เพิ่ม prop นี้
        />
      </div>
    </div>
  );
};

export default UserManagement;
