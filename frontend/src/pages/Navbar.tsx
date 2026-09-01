import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { GoHome } from "react-icons/go";
import {
  FaChevronUp,
  FaChevronDown,
  FaUserInjured,
  FaUserCog,
  FaProcedures,
} from "react-icons/fa";
import { GrSettingsOption } from "react-icons/gr";
import { MdOutlineSensors } from "react-icons/md";
import { RiBuildingFill, RiHospitalFill } from "react-icons/ri";
import { VscBellDot } from "react-icons/vsc";
import { IoLogOut } from "react-icons/io5";
import { BsLine } from "react-icons/bs";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/UserStore";
import { buildUrl } from "../services/http";

interface MenuItem {
  name: string;
  link?: string;
  icon: React.ElementType;
  submenus?: MenuItem[];
}

interface User {
  name: string;
  role: string;
  ward?: string;
  profilePic: string;
}

interface NavbarProps {
  setUser: (user: User | null) => void;
  setIsOnline: (status: boolean) => void;
  user: User | null;
}

const baseMenus: MenuItem[] = [
  { name: "หน้าหลัก", link: "/", icon: GoHome },
  {
    name: "จัดการ",
    icon: GrSettingsOption,
    submenus: [
      { name: "อาคาร", link: "/building-mangement", icon: RiBuildingFill },
      { name: "วอร์ด", link: "/ward-mangement", icon: FaProcedures },
      { name: "เตียงผู้ป่วย", link: "/bed-management", icon: RiHospitalFill },
      { name: "ผู้ป่วย", link: "/patient-management", icon: FaUserInjured },
      { name: "เซนเซอร์", link: "/sensor-management", icon: MdOutlineSensors },
      { name: "ประวัติการแจ้งเตือน", link: "/noti-history", icon: VscBellDot },
      { name: "การแจ้งเตือนไลน์", link: "/noti-line", icon: BsLine },
      { name: "ผู้ใช้งานระบบ", link: "/user-management", icon: FaUserCog },
    ],
  },
];

const Navbar: React.FC<NavbarProps> = ({ setUser, setIsOnline, user }) => {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setIsOnline(false);
    navigate("/login");
  };

  const isAdmin = (role?: string) =>
    !!role && /^(admin|แอดมิน)$/i.test(role.trim());

  // ✅ กรองเมนูตาม role ของ currentUser
  const filteredMenus = useMemo(() => {
    const restrictedRoles = ["doctor", "nurse", "หมอ", "พยาบาล"];
    const position = authStore.currentUser?.position?.toLowerCase() ?? "";

    // ถ้าเป็นหมอหรือพยาบาล → ซ่อนบางเมนูย่อย
    if (restrictedRoles.includes(position)) {
      return baseMenus.map((menu) => {
        if (menu.submenus) {
          const filteredSub = menu.submenus.filter(
            (sub) =>
              !["ผู้ใช้งานระบบ", "อาคาร", "การแจ้งเตือนไลน์"].includes(sub.name)
          );
          return { ...menu, submenus: filteredSub };
        }
        return menu;
      });
    }

    return baseMenus;
  }, [authStore.currentUser]);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId === null) return;

      try {
        const res = await userStore.getUser(userId);
        setUser({
          name: res.user_name,
          role: res.user_position,
          ward: res.ward?.ward_name ?? "-",
          profilePic: res.image_path
            ? buildUrl(res.image_path) ?? ""
            : "/src/assets/Male User.png",
        });
        setIsOnline(true);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div
      id="navbar"
      className={`flex flex-col bg-[#2E5361] min-h-screen ${
        open ? "w-72" : "w-16"
      } duration-500 text-white px-4 sticky top-0 z-20 h-16`}
    >
      {/* Header */}
      <div id="navbar-header" className="py-4 px-1 flex justify-between items-center">
        {/* User Profile */}
        <div className="flex items-center gap-2 relative">
          {user ? (
            <>
              {open && (
                <img
                  src={user.profilePic}
                  alt="User Profile"
                  className="w-14 h-14 rounded-full object-cover cursor-pointer absolute left-0 transition-transform hover:scale-110"
                />
              )}
              {open && (
                <div className="ml-16">
                  <p className="text-sm font-semibold max-w-[140px] truncate" title={user.name}>
                    {user.name}
                  </p>

                  <div className="flex">
                    <p className="text-xs text-gray-400 pr-1">ตำแหน่ง:</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>

                  {!isAdmin(user.role) && (
                    <div className="flex">
                      <p className="text-xs text-gray-400 pr-1">วอร์ด:</p>
                      <p className="text-xs text-gray-400">{user.ward}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="text-sm text-white hover:scale-105 transition-transform cursor-pointer"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>

        {/* Toggle */}
        <div className="py-3">
          <HiMenu
            size={26}
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-4 flex flex-col gap-4 relative">
        {filteredMenus.map((menu, index) =>
          menu.submenus ? (
            <div key={index}>
              <div
                className="flex items-center text-lg gap-3.5 font-medium p-2 hover:bg-[#879EA4] rounded-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {React.createElement(menu?.icon, { size: "25" })}
                <h2
                  style={{ transitionDelay: `${index + 3}00ms` }}
                  className={`whitespace-pre duration-500 ${
                    !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
                  }`}
                >
                  {menu?.name}
                </h2>
                <div className="ml-auto">
                  {open && (expanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />)}
                </div>
              </div>

              <div
                className={`transition-all ${
                  expanded ? "max-h-full opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden duration-300 ml-6 font-medium p-2`}
              >
                {menu.submenus.map((sub, i) => (
                  <Link
                    key={i}
                    to={sub.link!}
                    className="flex items-center gap-3.5 px-3 text-lg p-2 hover:bg-[#879EA4] rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <sub.icon size={25} />
                    <h2
                      style={{ transitionDelay: `${index + 3}00ms` }}
                      className={`whitespace-pre duration-500 ${
                        !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
                      }`}
                    >
                      {sub?.name}
                    </h2>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={index}
              to={menu.link!}
              className="flex items-center text-lg gap-3.5 font-medium p-2 hover:bg-[#879EA4] rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {React.createElement(menu?.icon, { size: "25" })}
              <h2
                style={{ transitionDelay: `${index + 3}00ms` }}
                className={`whitespace-pre duration-500 ${
                  !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
                }`}
              >
                {menu?.name}
              </h2>
            </Link>
          )
        )}
      </nav>

      {/* Logout */}
      <div className="py-1 border-gray-700 mt-auto flex-col">
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-lg gap-3.5 font-medium hover:bg-[#879EA4] rounded-md p-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <IoLogOut size={35} />
          <h2
            className={`whitespace-pre duration-500 ${
              !open ? "opacity-0 translate-x-28 overflow-hidden" : ""
            }`}
          >
            ออกจากระบบ
          </h2>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
