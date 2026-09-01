import { Notification } from "../types/notification";

export function sortNotificationByDate(notis: Notification[]): Notification[] {
  return [...notis].sort((a, b) => {
    const dateA = a.notification_createdate
      ? new Date(a.notification_createdate).getTime()
      : 0;
    const dateB = b.notification_createdate
      ? new Date(b.notification_createdate).getTime()
      : 0;
    return dateB - dateA; // เรียงจากใหม่ → เก่า
  });
}

export function sortByStatusAndDate(notifications: Notification[]) {
  return [...notifications].sort((a, b) => {
    // 1) Pending มาก่อน Accepted
    if (!a.notification_accepted && b.notification_accepted) return -1;
    if (a.notification_accepted && !b.notification_accepted) return 1;

    // 2) ถ้าสถานะเดียวกัน → เรียงวันที่ล่าสุดก่อน
    return (
      new Date(b.notification_updatedate ?? 0).getTime() -
      new Date(a.notification_updatedate ?? 0).getTime()
    );
  });
}
