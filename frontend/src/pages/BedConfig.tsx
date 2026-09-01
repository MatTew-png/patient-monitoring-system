import { useNavigate, useParams } from "react-router-dom";
import PatientWindow from "../components/BedConfig/PatientWindow.tsx";
import BedWindow from "../components/BedConfig/BedWindow.tsx";
import SensorTableWindow from "../components/BedConfig/SensorTableWindow.tsx";
import { useBedStore } from "../store/bedStore";
import { useEffect, useState } from "react";
import { Patient } from "../types/patient";
import { Sensor } from "../types/sensor";
import { Bed, BedSaveConfig } from "../types/bed";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import AddSensorDialog from "../components/BedConfig/AddSensorDialog.tsx";
import { useSensorStore } from "../store/sensorStore.ts";
// import { usePatientStore } from "../store/patientStore.ts";

const BedConfig: React.FC = () => {
  const { bed_id } = useParams<{ bed_id?: string }>();
  const bedStore = useBedStore();
  const sensorStore = useSensorStore();
  const navigate = useNavigate();
  // const patientStore = usePatientStore();
  const { loadBeds } = useBedStore();
  const [bed, setBed] = useState<Bed | undefined>();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [sensors, setSensor] = useState<Sensor[] | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlePatientSelect = (selectedPatient: Patient | undefined) => {
    setPatient(selectedPatient);
  };

  useEffect(() => {
    const fetchBed = async () => {
      if (bed_id) {
        const bedIdNumber = parseInt(bed_id);

        const foundBed = await bedStore.getBed(bedIdNumber);

        if (foundBed) {
          console.log("✅ Found bed:", foundBed);
          setPatient(foundBed.patient);
          setSensor(foundBed.sensors);
          setBed(foundBed);
        } else {
          // console.warn("⚠️ No bed found with ID:", bedIdNumber);
        }
      }
    };

    fetchBed();
  }, [bed_id, bedStore]);

  useEffect(() => {
    sensorStore.loadAllSensorFree();
  }, []);

  const handleSelectSensor = (selectedSensor: Sensor) => {
    setSensor((prevSensors) => {
      if (prevSensors) {
        const isDuplicate = prevSensors.some(
          (s) => s.sensor_type === selectedSensor.sensor_type
        );
        if (isDuplicate) {
          setError(
            `ไม่สามารถเพิ่มได้ เพราะมี Sensor type "${selectedSensor.sensor_type}" อยู่แล้ว`
          );
          return prevSensors; // ❌ stop
        }
        return [...prevSensors, selectedSensor];
      }
      return [selectedSensor];
    });

    // ถ้าไม่ซ้ำ ค่อยลบออกจาก sensorsFree
    const isDuplicate = sensors?.some(
      (s) => s.sensor_type === selectedSensor.sensor_type
    );
    if (!isDuplicate) {
      sensorStore.sensorsFree = sensorStore.sensorsFree.filter(
        (ss) => ss.sensor_id !== selectedSensor.sensor_id
      );
      handleCloseDialog();
    }
  };

  const handleDeleteSensor = (targetSensor: Sensor) => {
    sensorStore.sensorsFree = [targetSensor, ...sensorStore.sensorsFree];
    setSensor((prevSensors) => {
      if (prevSensors) {
        // ใช้ filter เพื่อลบเซนเซอร์ที่ไม่ตรงกับ sensorToDelete
        return prevSensors.filter(
          (sensor) => sensor.sensor_id !== targetSensor.sensor_id
        );
      }
      return [];
    });
  };

  const handleConfirm = () => {
    if (bed) {
      bed.patient = patient;
      bed.patient_id = patient?.patient_id;
      if (sensors) bed.sensors = sensors;
    }

    if (bed.patient_id && sensors.length === 0) {
      setError("กรุณาเลือกเซนเซอร์อย่างน้อย 1 ตัว");
      return;
    }

    if (bed) {
      const bedSaveConfig: BedSaveConfig = {
        bed_id: bed.bed_id,
        patient_id: bed.patient_id ?? null,
        sensors: bed.sensors.map((sensor) => ({
          sensor_id: sensor.sensor_id,
          bed_id: bed.bed_id,
        })),
      };
      bedStore.saveBedConfig(bed?.bed_id, bedSaveConfig);
    }

    if (bed && bed.bed_id) handleCancel();
    loadBeds();
    // bedStore.beds.find((item) => item.bed_id === bed?.bed_id ?? 0)?.patient =
    // bed?.patient;

    setTimeout(() => {
      bedStore.loadBeds();
    }, 100);
    setTimeout(() => {
      bedStore.loadBeds();
    }, 100);
    setTimeout(() => {
      bedStore.loadBeds();
    }, 100);
    // window.location.
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col p-4 bg-[#e7f0f3] min-h-screen">
      {/* Header */}
      <div className="flex justify-between p-4 rounded-lg">
        <h2 className="text-[#2E5361] text-4xl font-bold">
          โรงพยาบาลมหาวิทยาลัยบูรพา
        </h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#5E8892] text-white rounded-xl hover:bg-[#95BAC3] transition-transform duration-300 hover:scale-110"
          onClick={handleOpenDialog}
          id="btnAdd"
        >
          <Icon path={mdiPlus} size={1} />
          <span className="cursor-pointer">เพิ่มเซนเซอร์ใหม่</span>
        </button>
      </div>
      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="p-2">
            <BedWindow bed_config={bed ?? null} />
          </div>
          <div className="p-2">
            <PatientWindow
              patient_config={patient ?? null}
              onPatientSelect={handlePatientSelect}
            />
          </div>
        </div>
        {/* Right Column: Sensors */}
        <div className="p-2">
          <SensorTableWindow
            sensors={sensors ?? undefined}
            onDeleteSensor={handleDeleteSensor}
          />
        </div>
      </div>
      {/* Footer */}
      <div className="flex justify-end p-6 gap-4 ">
        <button
          className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
          onClick={handleConfirm}
          id="btnOk"
        >
          ยืนยัน
        </button>
        <button
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer"
          onClick={handleCancel}
          id="btnCancel"
        >
          ยกเลิก
        </button>
      </div>
      {/* ✅ AddSensorDialog */}
      {isDialogOpen && (
        <AddSensorDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSelectSensor={handleSelectSensor}
        />
      )}
      {/* ✅ Error Dialog */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              แจ้งเตือน
            </h3>
            <p>{error}</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-[#5E8892] text-white rounded-lg hover:bg-[#95BAC3]"
                onClick={() => setError(null)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedConfig;
