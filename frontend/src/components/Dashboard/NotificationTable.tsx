import React from "react";
import { Notification } from "../../types/notification";

interface Props {
  notifications: Notification[];
  formatDateTime: (datetime: string) => string;
}

const NotificationTable: React.FC<Props> = ({ notifications, formatDateTime }) => {
  return (
    <section id="NotiTable" className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
      <h3 className="text-xl font-bold mb-4 text-[#2E5361]">ประวัติการแจ้งเตือน</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
      ) : (
        <div className="overflow-auto max-h-78"> {/* เพิ่ม max-height และ scroll */}
          <table className="min-w-full border border-gray-300 table-fixed">
            <thead className="bg-[#95BAC3] sticky top-0 z-10"> {/* หัวตารางติดบน */}
              <tr>
                <th className="border border-gray-300 px-6 py-4 text-left">การแจ้งเตือน</th>
                <th className="border border-gray-300 px-6 py-4 text-left">วันที่/เวลา</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((noti) => {
                const eventText =
                  noti.sensor_notifications_config?.sensor_notifications_config_event ||
                  noti.notification_category ||
                  "-";
                const createdDate = formatDateTime(noti.notification_createdate || "");
                return (
                  <tr key={noti.notification_id}>
                    <td className="border border-gray-300 px-6 py-3">{eventText}</td>
                    <td className="border border-gray-300 px-6 py-3">{createdDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default NotificationTable;
