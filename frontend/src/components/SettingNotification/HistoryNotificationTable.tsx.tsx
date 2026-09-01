import React, { useEffect } from "react";
import { Bed } from "../../types/bed";
import { useSensorNotificationsConfigStore } from "../../store/sensorNotificationsConfigStore";

interface HistoryNotificationTableProps {
  bed: Bed;
  patient_id: number;
  sensor_id: number;
}

const HistoryNotificationTable: React.FC<HistoryNotificationTableProps> = ({
  bed,
  patient_id,
  sensor_id,
}) => {
  const { loadLogNotifications, targetLog, targetLogHistory } =
    useSensorNotificationsConfigStore();

  useEffect(() => {
    loadLogNotifications(bed.bed_id, patient_id);
  }, [bed.bed_id, patient_id, loadLogNotifications]);

  useEffect(() => {
    if (bed.bed_id && patient_id && sensor_id) {
      targetLog(bed.bed_id, patient_id, sensor_id);
    }
  }, [bed.bed_id, patient_id, sensor_id, targetLog]);

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-md"
      id="history-notification-table-wrapper"
    >
      <table className="w-full border-collapse" id="history-notification-table">
        <thead className="h-16" id="history-notification-header">
          <tr className="bg-[#B7D6DE]">
            <th className="p-2" id="col-date">
              วัน/เวลา
            </th>
            <th className="p-2" id="col-building">
              อาคาร
            </th>
            <th className="p-2" id="col-floor">
              ชั้น
            </th>
            <th className="p-2" id="col-room">
              ห้อง
            </th>
            <th className="p-2" id="col-bed">
              เตียง
            </th>
            <th className="p-2" id="col-event">
              การแจ้งเตือน
            </th>
            <th className="p-2" id="col-status">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody id="history-notification-body">
          {targetLogHistory?.notifications &&
          targetLogHistory?.notifications.length > 0 ? (
            targetLogHistory?.notifications.map((noti, index) => {
              // const rowColor = index % 2 === 0 ? "bg-white" : "bg-[#A1B5BC]";

              let statusText = "ยังไม่จัดการ";
              let statusColor: string = "text-[#FF0000] font-medium";
              if (noti.notification_accepted) {
                if (noti.notification_successed) {
                  statusText = "แจ้งเตือนเสร็จสิ้น";
                  statusColor = "text-[#0FB700] font-medium";
                } else {
                  statusText = "กำลังดำเนินการ";
                  statusColor = "text-[#FFA100] font-medium";
                }
              }

              return (
                <tr
                  key={index}
                  // className={`text-center ${rowColor}`}4
                  className={`
                              text-center 
                              bg-gradient-to-r from-white via-gray-100 to-white 
                              even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef] 
                              shadow-md
                            `}
                  id={`history-row-${index}`}
                >
                  <td className="p-2" id={`col-date-${index}`}>
                    {noti.notification_createdate
                      ? new Intl.DateTimeFormat("th-TH", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }).format(new Date(noti.notification_createdate))
                      : "-"}
                  </td>
                  <td className="p-2" id={`col-building-${index}`}>
                    {bed?.room.floor?.building.building_name}
                  </td>
                  <td className="p-2" id={`col-floor-${index}`}>
                    {bed?.room.floor?.floor_name}
                  </td>
                  <td className="p-2" id={`col-room-${index}`}>
                    {bed?.room.room_name}
                  </td>
                  <td className="p-2" id={`col-bed-${index}`}>
                    {bed?.bed_name}
                  </td>
                  <td className="p-2" id={`col-event-${index}`}>
                    {
                      noti.sensor_notifications_config
                        .sensor_notifications_config_event
                    }
                  </td>
                  <td
                    className={`p-2 ${statusColor}`}
                    id={`col-status-${index}`}
                  >
                    {statusText}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr id="history-empty-row">
              <td
                colSpan={7}
                className="p-4 text-center text-gray-500"
                id="history-empty-message"
              >
                ไม่มีข้อมูลการแจ้งเตือน {bed.bed_id}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryNotificationTable;
