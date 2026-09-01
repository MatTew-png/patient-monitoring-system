import React, { useState } from "react";

interface NotificationTabsProps {
  onTabChange: (tab: string) => void;
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("settings");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="flex gap-2 justify-start pb-4">
      <button
        className={`px-6 py-2 rounded-full cursor-pointer text-md font-medium transition-colors transition-all duration-300 hover:scale-105 active:scale-95 ${
          activeTab === "settings"
            ? "bg-[#85A8B8] text-white"
            : "bg-gray-300 text-gray-700"
        }`}
        onClick={() => handleTabClick("settings")}
        id="settingNoti"
      >
        ตั้งค่าการแจ้งเตือน
      </button>
      <button
        className={`px-6 py-2 rounded-full cursor-pointer text-md font-medium transition-colors transition-all duration-300 hover:scale-105 active:scale-95 ${
          activeTab === "timeline"
            ? "bg-[#85A8B8] text-white"
            : "bg-gray-300 text-gray-700"
        }`}
        onClick={() => handleTabClick("timeline")}
        id="timeline"
      >
        ไทม์ไลน์
      </button>
      <button
        className={`px-6 py-2 rounded-full cursor-pointer text-md font-medium transition-colors transition-all duration-300 hover:scale-105 active:scale-95 ${
          activeTab === "history"
            ? "bg-[#85A8B8] text-white"
            : "bg-gray-300 text-gray-700"
        }`}
        onClick={() => handleTabClick("history")}
        id="historyNoti"
      >
        ประวัติการแจ้งเตือน
      </button>
    </div>
  );
};

export default NotificationTabs;
