import React from "react";
import { Bed } from "../../types/bed";
import { FaBed } from "react-icons/fa";
import BuuLogo from "../../assets/BuuLogo.png";

interface Props {
  bed_config: Bed | undefined | null;
}

const BedWindow: React.FC<Props> = ({ bed_config }) => {
  return (
    <>
      {bed_config && (
        <div className="relative border-2 border-gray-300 rounded-md w-full h-1/2 bg-[#F0F0F0] p-3 h-full z-0">
          {/* ส่วนของข้อมูลเตียง */}
          <div className="relative z-10">
            <div className="flex items-center p-3 text-xl font-semibold">
              <FaBed className="mr-2 text-3xl text-[#2E5361]" />
              รายละเอียดเตียง
            </div>

            {/* อาคาร */}
            <div className="flex items-center p-3">
              <label htmlFor="building_name" className="pl-6 mr-2 font-medium">
                อาคาร:
              </label>
              <input
                id="building_name"
                type="text"
                className="border border-gray-300 rounded-xl pl-3 max-w-[300px]"
                value={bed_config?.room?.floor?.building?.building_name || ""}
                placeholder="Building Name"
                readOnly
              />
            </div>

            {/* ชั้น */}
            <div className="flex items-center p-3">
              <label htmlFor="floor_name" className="pl-6 mr-8">
                ชั้น:
              </label>
              <input
                id="floor_name"
                type="text"
                className="border border-gray-300 rounded-xl pl-3 max-w-[300px]"
                value={bed_config?.room?.floor?.floor_name || ""}
                placeholder="Floor Name"
                readOnly
              />
            </div>

            {/* วอร์ด */}
            <div className="flex items-center p-3">
              <label htmlFor="ward_name" className="pl-6 mr-4">
                วอร์ด:
              </label>
              <input
                id="ward_name"
                type="text"
                className="border border-gray-300 rounded-xl pl-3 max-w-[300px]"
                value={bed_config?.room?.ward?.ward_name || ""}
                placeholder="Ward Name"
                readOnly
              />
            </div>

            {/* ห้อง */}
            <div className="flex items-center p-3">
              <label htmlFor="room_name" className="pl-6 mr-6">
                ห้อง:
              </label>
              <input
                id="room_name"
                type="text"
                className="border border-gray-300 rounded-xl pl-3 max-w-[300px]"
                value={bed_config?.room?.room_name || ""}
                placeholder="Room Name"
                readOnly
              />
            </div>

            {/* เตียง */}
            <div className="flex items-center p-3">
              <label htmlFor="bed_name" className="pl-6 mr-4">
                เตียง:
              </label>
              <input
                id="bed_name"
                type="text"
                className="border border-gray-300 rounded-xl pl-3 max-w-[300px]"
                value={bed_config?.bed_name || ""}
                placeholder="Bed Name"
                readOnly
              />
            </div>
          </div>

          <img
            src={BuuLogo}
            alt="Logo"
            className="absolute right-20 bottom-10 w-50 h-50 pointer-events-none z-0"
          />
        </div>
      )}
    </>
  );
};

export default BedWindow;
