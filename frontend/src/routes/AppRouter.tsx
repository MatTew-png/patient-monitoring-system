import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/Home.tsx";
import BedConfig from "../pages/BedConfig.tsx";
import SettingNoti from "../pages/SettingNoti.tsx";
import SensorManagement from "../pages/Managements/SensorManagement.tsx";
import Login from "../pages/Login.tsx";
import PatientManagement from "../pages/Managements/PatientManagement/PatientManagement.tsx";
import AddPatientHome from "../pages/AddPatientHome.tsx";
import BedManagement from "../pages/Managements/BedManagement.tsx";
import UserManagement from "../pages/Managements/UserManagement.tsx";
import NotificationHistory from "../pages/Managements/NotificationHistory.tsx";
import PatientInformation from "../pages/Managements/PatientManagement/PatientInformation.tsx";
import ProtectedRoute from "./ProtectedRoute"; // ✅ import
import LocationManagement from "../pages/Managements/LocationManagement.tsx";
import WardManagement from "../pages/Managements/WardManagement.tsx"
import Dashboard from "../pages/Dashboard.tsx";
import LineGroupManagement from "../pages/Managements/LineGroupManagement.tsx"; // ✅ เพิ่มหน้า Unauthorized
// import EmergencyAlert from "../pages/EmergencyAlert.tsx";
// import { useNotificationStore } from "../store/notificationStore.ts"; // Import ตัวแจ้งเตือนฉุกเฉิน

const AppRouter: React.FC = () => {
  // const { showAlert, setShowAlert } = useNotificationStore();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={`bg-white ${isHome ? "overflow-auto flex" : ""}`}>
      {/* <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bed-config/:bed_id" element={<BedConfig />} />
        <Route path="/setting-noti/:bed_id" element={<SettingNoti />} />
        <Route path="/sensor-management" element={<SensorManagement />} />
        <Route path="/patient-management" element={<PatientManagement />} />
        <Route
          path="/patient-management/:patient_id/patient-information"
          element={<PatientInformation />}
        ></Route>
        <Route path="/bed-management" element={<BedManagement />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/noti-history" element={<NotificationHistory />} />
        <Route path="/add-patient-home" element={<AddPatientHome />} />
      </Routes> */}
      <Routes>
        {/* ❌ ไม่ต้องล็อกอิน */}
        <Route path="/login" element={<Login />} />

        {/* ✅ ต้องล็อกอินก่อน */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/bed-config/:bed_id" element={<ProtectedRoute><BedConfig /></ProtectedRoute>} />
        <Route path="/setting-noti/:bed_id" element={<ProtectedRoute><SettingNoti /></ProtectedRoute>} />
        <Route path="/sensor-management" element={<ProtectedRoute><SensorManagement /></ProtectedRoute>} />
        <Route path="/patient-management" element={<ProtectedRoute><PatientManagement /></ProtectedRoute>} />
        <Route path="/patient-management/:patient_id/patient-information" element={<ProtectedRoute><PatientInformation /></ProtectedRoute>} />
        <Route path="/bed-management" element={<ProtectedRoute><BedManagement /></ProtectedRoute>} />
        <Route path="/noti-history" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
        <Route path="/add-patient-home" element={<ProtectedRoute><AddPatientHome /></ProtectedRoute>} />
        <Route path="/ward-mangement" element={<ProtectedRoute><WardManagement /></ProtectedRoute>} />
        <Route path="/dashboard/:bed_id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* ❌ จำกัดไม่ให้ Doctor / Nurse / หมอ / พยาบาล เข้าได้ */}
        <Route
          path="/building-mangement"
          element={
            <ProtectedRoute allowedRoles={["Admin", "แอดมิน"]}>
              <LocationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/noti-line"
          element={
            <ProtectedRoute allowedRoles={["Admin", "แอดมิน"]}>
              <LineGroupManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["Admin", "แอดมิน"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Emergency Alert - ปรับการแสดงผลตาม path */}
      {/* {showAlert && (
        <div
          className={`bg-white z-20 ${
            isHome
              ? "sticky right-0 w-[88%] h-full"
              : "absolute right-0 w-90 h-full  top-20 z-20"
          }`}
        >
          <EmergencyAlert onClose={() => setShowAlert(false)} />
        </div>
      )} */}
    </div>
  );
};

export default AppRouter;
