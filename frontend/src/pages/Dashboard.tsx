import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Bed } from "../types/bed";
import { Notification } from "../types/notification";
import { usePatientStore } from "../store/patientStore";
import { Patient } from "../types/patient";
import { useBedStore } from "../store/bedStore";
import { useNotificationStore } from "../store/notificationStore";

import PatientInfoCard from "../components/Dashboard/PatientInfoCard";
import SensorCard from "../components/Dashboard/SensorCard";
import NotificationTable from "../components/Dashboard/NotificationTable";
import SleepTimelineGraph from "../components/Dashboard/SleepTimelineGraph";
import { MOCK_NOTIFICATIONS } from "../services/mockData";

import { buildWsUrl } from "../hooks/ws";
import { ChevronLeft } from "lucide-react";

const Dashboard: React.FC = () => {
  const bedStore = useBedStore();
  const patientStore = usePatientStore();
  const notificationStore = useNotificationStore();
  const { bed_id } = useParams<{ bed_id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialBed = (location.state as { bed?: Bed })?.bed;

  const [bed, setBed] = useState<Bed | undefined>(initialBed);
  const [patientData, setPatientData] = useState<Patient>();
  const [patientInformationData, setPatientInformationData] =
    useState<Patient>();
  const [realtimeSensors, setRealtimeSensors] = useState<Bed["sensors"]>(
    bed?.sensors ?? []
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchPatientData = async (patient_id: number) => {
    const res = await patientStore.getPatientWithDetail(patient_id);
    setPatientData(res);
  };

  const fetchInformationData = async (patient_id: number) => {
    const res = await patientStore.getPatientInformation(patient_id);
    setPatientInformationData(res);
  };

  const fetchNotificationsData = async (
    patient_id: number,
    sensor_ids: number[]
  ) => {
    try {
      if (!sensor_ids.length) {
        setNotifications(MOCK_NOTIFICATIONS);
        return;
      }

      const allPromises = sensor_ids.map((sensor_id) =>
        notificationStore.getNotificationsByPatientAndSensor(
          patient_id,
          sensor_id
        )
      );

      const settledResults = await Promise.allSettled(allPromises);

      const resultsArray = settledResults
        .filter((res): res is PromiseFulfilledResult<Notification[]> => res.status === "fulfilled")
        .map((res) => res.value);

      const combined: Notification[] = resultsArray.flat();

      const sorted = combined.length > 0
        ? combined.sort((a, b) =>
            (b.notification_createdate ?? "").localeCompare(
              a.notification_createdate ?? ""
            )
          )
        : MOCK_NOTIFICATIONS;

      setNotifications(sorted);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    const fetchFromApiIfNeeded = async () => {
      if (!bed_id) return;
      const bedIdNumber = parseInt(bed_id);

      let currentBed = bed;
      if (!currentBed) {
        currentBed = await bedStore.getBed(bedIdNumber);
        setBed(currentBed);
        setRealtimeSensors(currentBed?.sensors ?? []);
      }

      if (currentBed?.patient?.patient_id) {
        await fetchPatientData(currentBed.patient.patient_id);
        await fetchInformationData(currentBed.patient.patient_id);

        if (currentBed.sensors?.length) {
          const sensorIds = currentBed.sensors.map((s) => s.sensor_id);
          await fetchNotificationsData(
            currentBed.patient.patient_id,
            sensorIds
          );
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }

      // Live sensor value simulation if offline
      const interval = setInterval(() => {
        setRealtimeSensors((prev) =>
          prev.map((s) => {
            if (s.sensor_type === "heart_rate") {
              const val = String(72 + Math.floor(Math.random() * 6));
              const hist = [...(s.history_value_sensor || [])];
              if (hist.length) {
                hist[hist.length - 1] = {
                  ...hist[hist.length - 1],
                  history_value_sensor_value: val,
                  history_value_sensor_time: new Date().toISOString(),
                };
              }
              return { ...s, history_value_sensor: hist };
            }
            if (s.sensor_type === "spo2") {
              const val = String(98 + (Math.random() > 0.5 ? 1 : 0));
              const hist = [...(s.history_value_sensor || [])];
              if (hist.length) {
                hist[hist.length - 1] = {
                  ...hist[hist.length - 1],
                  history_value_sensor_value: val,
                  history_value_sensor_time: new Date().toISOString(),
                };
              }
              return { ...s, history_value_sensor: hist };
            }
            return s;
          })
        );
      }, 2500);

      return () => clearInterval(interval);
    };

    fetchFromApiIfNeeded();
  }, [bed_id]);

  if (!bed) {
    return <div className="p-4 text-red-600">ไม่พบข้อมูลเตียง {bed_id}</div>;
  }

  const getLatestSensorValue = (type: string) => {
    const sensor = realtimeSensors.find(
      (s) => s.sensor_type?.toLowerCase() === type.toLowerCase()
    );
    if (!sensor?.history_value_sensor?.length) {
      if (type === "heart_rate") return "74";
      if (type === "spo2") return "99";
      if (type === "respiration") return "16";
      return "-";
    }
    const sorted = [...sensor.history_value_sensor]
      .filter((v) => v.history_value_sensor_time || (v as any).timestamp)
      .sort(
        (a, b) =>
          new Date(a.history_value_sensor_time || (a as any).timestamp).getTime() -
          new Date(b.history_value_sensor_time || (b as any).timestamp).getTime()
      );
    const last = sorted[sorted.length - 1];
    return last?.history_value_sensor_value ?? (last as any)?.sensor_value ?? "74";
  };

  const formatDateTime = (datetimeString: string) => {
    if (!datetimeString) return "-";
    const dt = new Date(datetimeString);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(
      dt.getMonth() + 1
    ).padStart(2, "0")}/${dt.getFullYear()} ${String(dt.getHours()).padStart(
      2,
      "0"
    )}:${String(dt.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 space-y-6 bg-[#e7f0f3] min-h-screen">
      <section className="grid grid-cols-4 gap-4 items-stretch">
        {/* การ์ดข้อมูลผู้ป่วย */}
        <PatientInfoCard
          bed={bed}
          patientData={patientData}
          patientInformationData={patientInformationData}
        />

        {/* การ์ดเซ็นเซอร์ + คุณภาพการนอน */}
        <section className="col-span-2 grid grid-cols-3 gap-4 ">
          <SensorCard
            title="Heart Rate"
            value={getLatestSensorValue("heart_rate")}
            unit="bpm"
            min="60"
            max="166"
            iconSrc="/src/assets/dashboard/heart.png"
            graphSrc="/src/assets/dashboard/heartG.png"
            minColor="text-[#E27DAC]"
            maxColor="text-[#D22576]"
          />
          <SensorCard
            title="SpO2"
            value={getLatestSensorValue("spo2")}
            unit="%"
            min="94"
            max="110"
            iconSrc="/src/assets/dashboard/spo2.png"
            graphSrc="/src/assets/dashboard/spo2G.png"
            minColor="text-[#B0E2FF]"
            maxColor="text-[#009DFF]"
          />
          <SensorCard
            title="Respiration"
            value={getLatestSensorValue("respiration")}
            unit="rpm"
            min="7"
            max="27"
            iconSrc="/src/assets/dashboard/respiration.png"
            graphSrc="/src/assets/dashboard/respirationG.png"
            minColor="text-[#F5E083]"
            maxColor="text-[#D3AE09]"
          />
          {/* กรอบคุณภาพการนอน */}
          {/* <section className="col-span-3 bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="text-xl font-bold mb-4 text-[#2E5361]">
              คุณภาพการนอน
            </h3>
            {/* เนื้อหาภายในใส่เพิ่มตรงนี้ */}
          {/* </section> */} 
        </section>
      </section>

      <section className="grid grid-cols-2 gap-4 ">
        <NotificationTable
          notifications={notifications}
          formatDateTime={formatDateTime}
        />
        <SleepTimelineGraph
          sensor={bed?.sensors.find((s) => s.sensor_type === "bed_sensor")}
        />
      </section>

      <div className="flex justify-end mt-6">
        <button
          id="btnBack"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1 w-30 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] drop-shadow-md cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
        >
          {/* วงกลมไอคอน */}
          <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
            <ChevronLeft size={20} className="text-[#5E8892]" strokeWidth={2.5} />
          </div>
          <span className="text-white rounded-xl">ย้อนกลับ</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
