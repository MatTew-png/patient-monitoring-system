import { useState, useEffect } from "react";
import { Notification } from "../types/notification";
import { useNotificationStore } from "../store/notificationStore";
import NotificationList from "../components/Alert/NotificationList";

interface HistoryAlertProps {
  onClose?: () => void;
}

export default function HistoryAlert({ onClose }: HistoryAlertProps) {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [allNotificationsWithAccepted, setAllNotificationsWithAccepted] =
    useState<Notification[]>([]);

  const {
    sosDatas,
    sosDataWithAccepted,
    emergencyDatas,
    emergencyDataWithAccepted,
    selectedAlertType,
    moveToAccepted,
    acceptEmergencyByNotification,
    acceptSos,
    successEmergencyByNotification,
    successSos,
  } = useNotificationStore();

  // merge helpers (dedupe by id just in case)
  const sortDesc = (a: Notification, b: Notification) => {
    const ta = a.notification_createdate
      ? new Date(a.notification_createdate).getTime()
      : 0;
    const tb = b.notification_createdate
      ? new Date(b.notification_createdate).getTime()
      : 0;
    return tb - ta;
  };
  const uniqById = (arr: Notification[]) => {
    const seen = new Set<number>();
    return arr.filter((n) =>
      seen.has(n.notification_id) ? false : seen.add(n.notification_id)
    );
  };

  // pending
  useEffect(() => {
    setAllNotifications(
      uniqById([...sosDatas, ...emergencyDatas]).sort(sortDesc)
    );
  }, [sosDatas, emergencyDatas]);

  // accepted
  useEffect(() => {
    setAllNotificationsWithAccepted(
      uniqById([...sosDataWithAccepted, ...emergencyDataWithAccepted]).sort(
        sortDesc
      )
    );
  }, [sosDataWithAccepted, emergencyDataWithAccepted]);

  const updateStatus = (
    id: number,
    accepted?: boolean,
    successed?: boolean
  ) => {
    setAllNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === id
          ? {
              ...n,
              notification_accepted: accepted ?? n.notification_accepted,
              notification_successed: successed ?? n.notification_successed,
              notification_updatedate: new Date().toISOString(),
            }
          : n
      )
    );
    setAllNotificationsWithAccepted((prev) =>
      prev.map((n) =>
        n.notification_id === id
          ? {
              ...n,
              notification_accepted: accepted ?? n.notification_accepted,
              notification_successed: successed ?? n.notification_successed,
              notification_updatedate: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const getTimeElapsed = (notificationDate: string | Date): string => {
    const date =
      typeof notificationDate === "string"
        ? new Date(notificationDate)
        : notificationDate;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} วินาทีที่แล้ว`;
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  };

  // ───────────────────────── Bulk handlers ─────────────────────────
  const handleAcceptAll = () => {
    // only not accepted & not successed
    const candidates = allNotifications.filter(
      (n) => !n.notification_successed && !n.notification_accepted
    );

    for (const n of candidates) {
      // local UI
      updateStatus(n.notification_id, true, undefined);

      // store-side
      const type =
        n.notification_category === "Emergency" ? "emergency" : "sos";
      moveToAccepted(n.notification_id, type);

      if (n.notification_category === "Emergency") {
        acceptEmergencyByNotification(n.notification_id);
      } else if (n.notification_category === "SOS") {
        acceptSos(n.notification_id);
      }
    }
  };

  const handleSuccessAll = () => {
    // success only accepted & not yet successed across both lists
    const pool = [...allNotifications, ...allNotificationsWithAccepted];
    const toSuccess = pool.filter(
      (n) => n.notification_accepted === true && !n.notification_successed
    );
    const done = new Set<number>();

    for (const n of toSuccess) {
      if (done.has(n.notification_id)) continue;
      done.add(n.notification_id);

      // local UI
      updateStatus(n.notification_id, undefined, true);

      // store-side
      if (n.notification_category === "Emergency") {
        successEmergencyByNotification(n.notification_id);
      } else if (n.notification_category === "SOS") {
        successSos(n.notification_id);
      }
    }
  };
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col z-20 border-2 border-[#2E5361] rounded-3xl">
      {/* Header */}
      <div className="flex justify-between items-center h-25 text-[#2E5361] p-4 rounded-3xl relative">
        <h3
          className="text-3xl font-semibold flex-grow text-center"
          style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.3)" }}
        >
          {selectedAlertType || "แจ้งเตือนทั้งหมด"}
        </h3>
        <button
          id="btnClose"
          onClick={onClose}
          className="text-[#2E5361] text-xl hover:text-gray-300 absolute top-3 right-3 cursor-pointer"
          aria-label="Close alert"
        >
          ✖
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-center items-center mt-1 gap-12">
        <button
          id="btnAcceptAll"
          onClick={handleAcceptAll}
          className="px-4 py-2 rounded-xl bg-yellow-300 text-gray-900 text-ml font-semibold hover:bg-yellow-400 hover:shadow-lg transition"
        >
          Accept all
        </button>
        <button
          id="btnSuccessAll"
          onClick={handleSuccessAll}
          className="px-4 py-2 rounded-xl bg-green-500 text-gray-900 text-ml font-semibold hover:bg-green-600 hover:shadow-lg transition"
        >
          Success all
        </button>
      </div>

      {/* Content */}
      <div className="mt-3 flex-1 overflow-y-auto">
        {allNotifications.length === 0 &&
        allNotificationsWithAccepted.length === 0 ? (
          <p className="text-gray-500 text-center mt-5">ไม่มีการแจ้งเตือน</p>
        ) : (
          <NotificationList
            notifications={allNotifications}
            notificationsWithAccepted={allNotificationsWithAccepted}
            updateStatus={updateStatus}
            getTimeElapsed={getTimeElapsed}
          />
        )}
      </div>
    </div>
  );
}
