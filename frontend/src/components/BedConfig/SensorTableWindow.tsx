import React from "react";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";
import { Sensor } from "../../types/sensor";
import { MdSensors } from "react-icons/md";

interface Props {
  sensors: Sensor[] | undefined;
  onDeleteSensor: (sensor: Sensor) => void;
}

// useEffect(()=>{
//         loadAllSensorFree().then((data: Sensor[]) => {
//           setSensors(data); // เซ็ตค่าข้อมูลเซนเซอร์จาก store
//         });
// },[])

const SensorTableWindow: React.FC<Props> = ({ sensors, onDeleteSensor }) => {
  return (
    <>
      {sensors !== undefined && (
        <div className="flex flex-col border-2 border-gray-300 p-4 bg-[#F0F0F0] rounded-md min-h-[620px]">
          <h2 className="flex text-xl font-semibold mb-4 items-center">
            <MdSensors className="mr-2 text-3xl text-[#2E5361]" />
            รายการเซนเซอร์
          </h2>
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#95BAC3]  ">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-medium text-base"
                  >
                    Sensor_id
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left  font-medium  text-black uppercase tracking-wider font-extrabold text-base"
                  >
                    เซนเซอร์
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-end  font-medium  text-black uppercase tracking-wider font-extrabold text-base"
                  >
                    ดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {sensors.map((sensor, index) => (
                  <tr
                    key={index}
                    className="bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap pl-13">
                      {sensor.sensor_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sensor.sensor_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-4 justify-end ">
                        {/* <Icon
                          data-testid="settings-icon"
                          path={mdiCog}
                          size={1}
                          className="text-gray-600 hover:text-gray-900 cursor-pointer"
                        /> */}
                        <div
                          id="delete-icon"
                          className="mr-4"
                          onClick={() => onDeleteSensor(sensor)}
                        >
                          <Icon
                            data-testid="delete-icon"
                            path={mdiDelete}
                            size={1}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default SensorTableWindow;
