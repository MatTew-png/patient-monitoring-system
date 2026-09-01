import React from "react";
import { Notification } from "../../types/notification";
import { useNotificationStore } from "../../store/notificationStore";

interface NotificationCardProps {
  notification: Notification;
  updateStatus: (id: number, accepted?: boolean, successed?: boolean) => void;
  getTimeElapsed: (notificationDate: string | Date) => string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  updateStatus,
  getTimeElapsed,
}) => {
  const notificationStore = useNotificationStore();
  const handleTabClick = (notification: Notification) => {
    updateStatus(notification.notification_id, true, undefined);

    const type =
      notification.notification_category === "Emergency" ? "emergency" : "sos";
    notificationStore.moveToAccepted(notification.notification_id, type);

    console.log(notification.notification_id);
    if (notification.notification_category === "Emergency") {
      notificationStore.acceptEmergencyByNotification(
        notification.notification_id
      );
    } else if (notification.notification_category === "SOS") {
      notificationStore.acceptSos(notification.notification_id);
    }
  };

  const handleCompleteClick = () => {
    // อัปเดตสถานะเป็น "เสร็จสิ้น"
    updateStatus(notification.notification_id, undefined, true);
    notification.notification_successed = true;
    console.log("accepted", notification.notification_accepted);
    console.log("successed", notification.notification_successed);
    console.log(notification.notification_id);
    if (notification.notification_accepted !== true) {
      console.log("not accepeted cant success");
    } else {
      if (notification.notification_category === "Emergency") {
        notificationStore.successEmergencyByNotification(
          notification.notification_id
        ); // ลบการแจ้งเตือนจากลิสต์
      } else if (notification.notification_category === "SOS") {
        notificationStore.successSos(notification.notification_id);
      }
    }
  };

  // กำหนดสีพื้นหลังตามประเภทการแจ้งเตือน
  const getBackgroundColor = () => {
    switch (notification.notification_category) {
      case "Emergency":
        return "bg-[#FFCBCC]";
      case "SOS":
        return "bg-[#FFF7AF]";
      default:
        return "bg-slate-100";
    }
  };

  const formatDateToThai = (date: string) => {
    const d = new Date(date);

    // Thai year (Buddhist Era) is 543 years ahead of Gregorian year
    const thaiYear = d.getFullYear() + 543;

    // Format the date to dd/mm/yyyy hh:mm (e.g., "7/01/2568 20:31")
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JS
    const year = thaiYear;
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // const checkStatus = () => {
  //   if(notification.notification_accepted){
  //     updateStatus(notification.notification_id,true, undefined);
  //   }else if(notification.notification_successed){
  //     updateStatus(notification.notification_id, undefined, true);
  //   }
  // }

  return (
    <div
      id={`notification-card-${notification.notification_id}`}
      className={`flex items-center p-4 ${getBackgroundColor()} rounded-lg shadow`}
    >
      <div className="flex-1 justify-end">
        <p className="font-semibold text-lg text-[#DB0000]">
          {notification.log_bed_patient_sensor?.bed?.room?.room_name ||
            "ไม่ระบุห้อง"}
          &nbsp; {/* spacebar */}
          {notification.log_bed_patient_sensor?.bed?.bed_name || "ไม่ระบุเตียง"}
          &nbsp; {/* spacebar */}(
          {notification.sensor_notifications_config
            ?.sensor_notifications_config_event || "ไม่ระบุข้อความ"}
          ){/* RM004 เตียง 4 (ไม่อยู่ที่เตียง) */}
        </p>
        <p className="text-black">
          อาคาร :{" "}
          {notification.log_bed_patient_sensor?.bed?.room.floor?.building
            .building_name || "ไม่ระบุอาคาร"}
          {" " +
            notification.log_bed_patient_sensor?.bed?.room.floor
              ?.floor_name}{" "}
          {notification.log_bed_patient_sensor?.bed?.room.room_name}
          {/* อาคารผู้ป่วยใน */}
        </p>
        {/* <p className="text-black">
          ประเภท: {notification.notification_category}
        </p> */}
        <p className="text-black">
          ผู้ป่วย :{" "}
          {notification.log_bed_patient_sensor?.patient?.patient_disease ||
            "ไม่ระบุโรค"}
          {/* ผู้ป่วย : Alcoholism */}
        </p>
        <p className="text-black">
          ข้อความ :
          <span
            id="message-content"
            className={
              notification.notification_category === "Emergency"
                ? "text-[#DB0000] font-semibold" // Emergency: Red color
                : "text-black" // SOS or any other category: Default black color
            }
          >
            &nbsp; {/* spacebar */}
            {notification.sensor_notifications_config
              ?.sensor_notifications_config_event || "ไม่ระบุข้อความ"}
          </span>
          {/* ข้อความ : ไม่อยู่ที่เตียง */}
        </p>

        {/* แสดงสถานะ */}
        <p
          id="notification-status"
          className={`font-semibold ${
            notification.notification_successed
              ? "text-gray-400"
              : notification.notification_accepted === false
              ? "text-[#35B1F6]"
              : notification.notification_accepted === true
              ? "text-[#E77200]"
              : "text-gray-400"
          }`}
        >
          สถานะ:{" "}
          {notification.notification_successed
            ? "เสร็จสิ้น"
            : notification.notification_accepted
            ? "กำลังดำเนินการ"
            : "รอการตอบรับ"}
        </p>
        <p className="text-gray-500 text-sm text-right" id="notification-date">
          {notification.notification_createdate
            ? formatDateToThai(notification.notification_createdate)
            : "ไม่ระบุเวลา"}
          {/* 7/01/2568  20:31 */}
        </p>

        <div>
          {/* ปุ่มแสดงเป็นข้อความแทน */}
          <div
            id="notification-actions"
            className="flex justify-between space-x-3 mt-2"
          >
            {/* แสดงปุ่ม "รับทราบ" ตลอดเวลา */}
            {!notification.notification_successed &&
              !notification.notification_accepted && (
                <button
                  id="btnGotit"
                  onClick={() => handleTabClick(notification)}
                  className="text-[#007FCF] font-semibold hover:text-[#7cb1d0] cursor-pointer"
                >
                  รับทราบ
                </button>
              )}

            {/* แสดงปุ่ม "เสร็จสิ้น" ถ้าไม่ได้รับการยอมรับ */}
            {!notification.notification_successed &&
              notification.notification_accepted !== false && (
                <button
                  id="btnComplete"
                  onClick={handleCompleteClick}
                  className="text-[#22c265] font-semibold hover:text-[#7bdebf] animate-jump1 cursor-pointer"
                >
                  เสร็จสิ้น
                </button>
              )}

            {/* เวลาที่ผ่านไปของการแจ้งเตือน */}
            <p id="elapsed-time" className="text-gray-500 text-right">
              {getTimeElapsed(
                new Date(notification.notification_createdate ?? new Date())
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  notificationsWithAccepted: Notification[];
  updateStatus: (id: number, accepted?: boolean, successed?: boolean) => void;
  getTimeElapsed: (notificationDate: string | Date) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  updateStatus,
  getTimeElapsed,
  notificationsWithAccepted,
}) => {
  return (
    <div
      id="notification-list-wrapper"
      className="p-4 space-y-4 overflow-auto flex-1"
    >
      {notifications.map((noti) => (
        <NotificationCard
          key={noti.notification_id}
          notification={noti}
          updateStatus={updateStatus}
          getTimeElapsed={getTimeElapsed}
        />
      ))}
      {notificationsWithAccepted.map((notiWA) => (
        <NotificationCard
          key={notiWA.notification_id}
          notification={notiWA}
          updateStatus={updateStatus}
          getTimeElapsed={getTimeElapsed}
        />
      ))}
    </div>
  );
};

export default NotificationList;
