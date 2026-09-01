import React, { useEffect, useState } from "react";
import { Bed } from "../../types/bed";
import SensorCard from "./sensorCard";
import { Sensor } from "../../types/sensor";
import { useNavigate } from "react-router-dom";
import BedIcon from "./BedIcon";
import { HiDotsHorizontal } from "react-icons/hi";

interface Props {
  bed: Bed;
}

const BedCard: React.FC<Props> = ({ bed }) => {
  const navigate = useNavigate();

  const [noti_bedCard, setNoti_bedCard] = useState(1);

  const goToSettingNoti = () => {
    // console.log("Navigating to SettingNoti with bed_id:", bed.bed_id);
    navigate(`/setting-noti/${bed.bed_id}`);
  };

  const configBedById = () => {
    // console.log("Navigating to bed config with bed_id:", bed.bed_id); // Log ค่าก่อน navigate
    navigate(`/bed-config/${bed.bed_id}`); // ใช้ backticks และ template literals
  };

  const goToDashboard = () => {
    if (bed.patient) {
      navigate(`/dashboard/${bed.bed_id}`, { state: { bed } });
    }
  };
  const [showSensorSet, setShowSensorSet] = useState<Sensor[]>([]);

  // ฟังก์ชันที่ใช้ในการส่งเซ็นเซอร์ไปที่ showSensorSet
  const updateShowSensorSet = (sensor: Sensor) => {
    setShowSensorSet((prevState) => {
      const exists = prevState.some(
        (s) => s.sensor_type === sensor.sensor_type
      );

      if (exists) {
        // ถ้ามีอยู่แล้ว -> ให้ลบออก
        return prevState.filter((s) => s.sensor_type !== sensor.sensor_type);
      } else {
        // ถ้ายังไม่มี -> ให้เพิ่มเข้าไป
        return [...prevState, sensor];
      }
    });

    // console.log(exists ? "Removed sensor from showSensorSet:" : "Added sensor to showSensorSet:", sensor);
  };

  const getFilteredSensorList = () => {
    return bed.sensors.filter(
      (sensor) =>
        !showSensorSet.some(
          (selectedSensor) => selectedSensor.sensor_type === sensor.sensor_type
        )
    );
  };

  // useEffect(() => {
  //   bed.sensors.forEach((item) => {
  //     const notif = item.history_value_sensor[0]?.notification_level ?? 0;
  //     if (![1, 2, 3].includes(notif)) {
  //       item.history_value_sensor[0].notification_level = 1;
  //     }
  //   });
  // }, [bed]);
  const [bedSensor, setBedSensor] = useState<Sensor | null>(null);
  const [indexSensorNotOnPages, setIndexSensorNotOnPages] = useState(0);

  useEffect(() => {
    if (bed.selectedShowSensorId && bed.selectedShowSensorId.length > 0) {
      // ✅ อัพเดท bedSensor
      setBedSensor(
        bed.sensors.find((ss) => ss.sensor_type === "bed_sensor") || null
      );

      // ✅ อัพเดท ShowSensorSet
      const filteredSensors = bed.sensors.filter((sensor) =>
        bed.selectedShowSensorId?.includes(sensor.sensor_id ?? 0)
      );
      setShowSensorSet(filteredSensors);
    }
  }, [bed.selectedShowSensorId, bed.sensors]);

  useEffect(() => {
    if (bed.selectedShowSensorId && bed.selectedShowSensorId.length > 0) {
      const nonMatchingSensors = bed.sensors.filter((sensor) => {
        const notif = sensor.history_value_sensor[0]?.notification_level;
        return (
          !bed.selectedShowSensorId?.includes(sensor.sensor_id ?? 0) &&
          sensor.sensor_type !== "bed_sensor" &&
          (notif === 2 || notif === 3)
        );
      });

      // ✅ ตั้งค่า noti_bedCard
      if (nonMatchingSensors.length > 0) {
        setNoti_bedCard(2);
        if (nonMatchingSensors.length === 1) {
          setNoti_bedCard(
            nonMatchingSensors[0].history_value_sensor[0].notification_level ??
              1
          );
        } else {
          try {
            setNoti_bedCard(
              nonMatchingSensors[indexSensorNotOnPages].history_value_sensor[0]
                .notification_level ?? 1
            );
            setIndexSensorNotOnPages(indexSensorNotOnPages + 1);
          } catch {
            setIndexSensorNotOnPages(0);
          }
        }
      } else {
        setNoti_bedCard(1);
      }
    }
  }, [bed]); // ✅ ทำครั้งเดียว

  return (
    <div
      id="bedCard"
      className={`flex flex-row justify-between rounded-lg m-1 p-2 bg-gray-200 ${
        noti_bedCard === 2
          ? "bg-yellow-400"
          : noti_bedCard === 3
          ? "bg-red-400"
          : ""
      }`}
    >
      <div
        id="bedcardSection"
        className={`col-span-4 border border-black rounded-lg p-4 w-72 h-[300px] flex flex-col items-center overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)] ${
          bedSensor?.history_value_sensor[0]?.notification_level == 2
            ? "bg-yellow-400"
            : bedSensor?.history_value_sensor[0]?.notification_level == 3
            ? "bg-red-300"
            : "bg-white" // ใส่ bg-white เป็น default เฉพาะกรณีไม่ตรง
        }`}
        onClick={goToDashboard}
      >
        {/* แถวที่ 1: ห้อง + เตียง + ไอคอน */}
        <div id="bed" className="flex justify-between w-full items-center">
          <p id="bedName" className="text-lg font-medium truncate">
            <strong></strong> {bed.room.room_name} {bed.bed_name}
          </p>
          <div className="flex gap-1 cursor-pointer justify-end">
            <HiDotsHorizontal
              title="settingNoti"
              onClick={(e) => {
                e.stopPropagation(); // หยุดไม่ให้ฟอง event ไป parent
                goToSettingNoti();
              }}
              size={24}
              id="settingNoti"
            />
            {/* <span title="settingNoti" onClick={goToSettingNoti}>
              ⋮
            </span> */}
            <span
              title="config"
              onClick={(e) => {
                e.stopPropagation();
                configBedById();
              }}
              className="text-xl justify-end"
              id="configBed"
            >
              ⚙️
            </span>
          </div>
        </div>
        {/* แสดงค่าจากเซ็นเซอร์เตียง */}
        {!bed.patient ? (
          <div className=" my-3 text-red-500" id="noPatient">
            ไม่มีผู้ป่วย
          </div>
        ) : (
          <>
            {bed.sensors
              ?.filter((sensor) => sensor.sensor_type === "bed_sensor")
              .map((bedsensor, index) => (
                <div key={index} className=" my-3 " id="bedSensor">
                  {bedsensor.history_value_sensor.slice(-1)[0]
                    ?.history_value_sensor_value ?? 0}
                  {/* {bedsensor.history_value_sensor} */}
                </div>
              ))}
          </>
        )}

        {/* แถวที่ 2: ไอคอนเตียง */}
        <BedIcon
          bedsensors={bed.sensors?.filter(
            (sensor) => sensor.sensor_type === "bed_sensor"
          )}
          patient={bed.patient}
          addPatient={configBedById}
        />
        {/* แถวที่ 3: ชื่อผู้ป่วย */}
        <p id="patientName" className="text-lg mt-auto">
          <strong></strong> {bed.patient?.patient_name}
        </p>
      </div>
      <div
        id="sensorSection"
        className="col-span-2 flex flex-col justify-start items-center gap-2 pl-2 max-h-[300px] overflow-y-auto"
      >
        {/* Render SensorCards conditionally */}
        {showSensorSet.length > 0 ? (
          <SensorCard
            sensor={showSensorSet[0]} // ส่งข้อมูลจาก showSensorSet แทน
            sensorList={getFilteredSensorList()} // ใช้แค่ค่าใน showSensorSet
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        ) : (
          <SensorCard
            sensorList={getFilteredSensorList()}
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        )}
        {showSensorSet.length > 1 ? (
          <SensorCard
            sensor={showSensorSet[1]} // ส่งข้อมูลจาก showSensorSet แทน
            sensorList={getFilteredSensorList()} // ใช้แค่ค่าใน showSensorSet
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        ) : (
          <SensorCard
            sensorList={getFilteredSensorList()}
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        )}
        {showSensorSet.length > 2 ? (
          <SensorCard
            sensor={showSensorSet[2]} // ส่งข้อมูลจาก showSensorSet แทน
            sensorList={getFilteredSensorList()} // ใช้แค่ค่าใน showSensorSet
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        ) : (
          <SensorCard
            sensorList={getFilteredSensorList()}
            updateSensorSet={updateShowSensorSet}
            patient={bed.patient}
            bed_id={bed.bed_id}
          />
        )}
      </div>
    </div>
  );
};

export default BedCard;
