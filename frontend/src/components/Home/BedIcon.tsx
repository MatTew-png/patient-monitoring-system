import React from "react";
import LeftSide from "../../assets/LeftSide.png";
import RightSide from "../../assets/RightSide.png";
import Straight from "../../assets/Straight.png";
import Sit from "../../assets/Sit.png";
import NotHere from "../../assets/NotHere.png";
import Default from "../../assets/default.png";
import { Patient } from "../../types/patient";

interface BedSensor {
  sensor_type: string;
  history_value_sensor: {
    history_value_sensor_value: string;
  }[];
}

interface BedIconProps {
  patient?: Patient;
  bedsensors: BedSensor[];
  addPatient: () => void;
}

const BedIcon: React.FC<BedIconProps> = ({
  bedsensors,
  patient,
  addPatient,
}) => {
  const iconMap: { [key: string]: string } = {
    ตะแคงซ้าย: LeftSide,
    ตะแคงขวา: RightSide,
    นอนหงาย: Straight,
    นั่งบนเตียง: Sit,
    ไม่อยู่ที่เตียง: NotHere,
  };

  if (!patient) {
    return (
      <div
        className="flex items-center justify-center cursor-pointer pt-6"
        onClick={addPatient}
        id="btnAddPatient"
      >
        <i className="bi bi-patch-plus-fill text-7xl text-[#2E5361]"></i>
      </div>
    );
  }

  return bedsensors?.map((bedsensor, index) => {
    const sensorValue =
      bedsensor.history_value_sensor.slice(-1)[0]?.history_value_sensor_value ??
      "";

    const iconPath = iconMap[sensorValue] || Default;

    const iconSize =
      sensorValue === "นั่งบนเตียง" ? "w-34 h-34" : "w-40 h-40 mb-2";

    return (
      <div key={index} className="flex items-center">
        <img src={iconPath} alt={sensorValue} className={`${iconSize}`} id="bedImgValue"/>
      </div>
    );
  });
};

export default BedIcon;
