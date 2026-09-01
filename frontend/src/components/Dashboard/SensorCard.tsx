import React from "react";

interface Props {
  title: string;
  value: string | number;
  unit: string;
  min: string | number;
  max: string | number;
  iconSrc: string;
  graphSrc: string;
  minColor: string;
  maxColor: string;
}

const SensorCard: React.FC<Props> = ({
  title,
  value,
  unit,
  min,
  max,
  iconSrc,
  // graphSrc,
  minColor,
  maxColor,
}) => {
  // แปลง title เป็นตัวย่อสำหรับ Min/Max
  const shortNameMap: Record<string, string> = {
    "Heart Rate": "HR",
    SpO2: "spO2",
    Respiration: "RP",
  };
  const shortName = shortNameMap[title] || title;

  return (
    <div id="sensorCard" className="relative bg-[#2E5361] p-4 rounded-2xl shadow text-center h-60">
      <div className="flex items-center justify-center space-x-2">
        <img className="w-8" src={iconSrc} alt={title} />
        <h3 id="sensorName" className="font-medium text-white text-lg">{title}</h3>
      </div>
      {/* <img src={graphSrc} alt={`${title} graph`} /> */}
      {/* <div className="flex items-center justify-center space-x-2">
        <p className="text-6xl mt-11 font-semibold text-white">{value}</p>
        <p className="text-sm mt-2 text-white">{unit}</p>
      </div> */}
      <div className="relative flex items-center justify-center">
        <p id="sensorValue" className="text-6xl mt-11 font-semibold text-white text-center">{value}</p>
        <div className="justify-end">
          <p id="sensorUnit" className="absolute top-[75%] ml-4 text-sm text-white">
          {unit}
          </p>
        </div>
      </div>
      <div className="absolute bottom-2 inset-x-2 px-2 flex justify-between text-sm text-[#CFD1D2]">
        <div >
          <p>Min {shortName}</p>
          <p id="sensorMin" className={`${minColor} font-bold text-lg`}>{min}</p>
        </div>
        <div >
          <p>Max {shortName}</p>
          <p id="sensorMax" className={`${maxColor} font-bold text-lg`}>{max}</p>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
