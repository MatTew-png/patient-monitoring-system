import React, { useEffect } from "react";
import { Sensor } from "../../types/sensor";
import { motion, AnimatePresence } from "framer-motion";
import { useBedStore } from "../../store/bedStore";

interface Props {
  sensorList: Sensor[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sensor: Sensor) => void;
  bed_id: number;
}

const SensorListDialog: React.FC<Props> = ({
  onClose,
  sensorList,
  onSelect,
  isOpen,
  bed_id,
}) => {
  //store
  const bedStore = useBedStore();

  const handleSelect = (sensor: Sensor) => {
    onSelect(sensor);
    if (sensor) bedStore.saveSelectedShowSensorId(bed_id, sensor.sensor_id);
    onClose();
  };

  const filteredSensorList = sensorList.filter(
    (sensor) => sensor.sensor_type !== "bed_sensor"
  );

  // Prevent scrolling on the body when dialog is open
  // useEffect(() => {
  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = "unset";
  //   };
  // }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fully transparent overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            id="sensorDialogOverlay"
          />

          {/* Dialog */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 50,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 50,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none"
          >
            <div
              className="bg-white bg-opacity-70 p-6 rounded-lg w-96 pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              id="sensorDialog"
            >
              <h2 className="text-2xl mb-4 text-[#2E5361]">Sensor List</h2>
              <ul id="sensorList">
                {filteredSensorList.map((sensor, index) => (
                  <li
                    key={index}
                    className="border-b py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSelect(sensor)}
                    id="sensorItem"
                  >
                    {sensor.sensor_type}
                  </li>
                ))}
              </ul>
              <div className="flex justify-center">
                <button
                  className="bg-[#95BAC3] text-white py-2 px-4 rounded-full mt-4 cursor-pointer
              tracking-wide font-semibold focus:outline-none focus:shadow-outline 
              hover:bg-[#6B97A1] shadow-lg transition ease-in duration-300"
                  onClick={onClose}
                  id="btnClose"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SensorListDialog;
