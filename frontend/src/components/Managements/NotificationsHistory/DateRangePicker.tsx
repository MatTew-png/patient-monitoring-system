import React, { useEffect, useRef } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (range: { startDate: string; endDate: string }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // ดักการเลือก startDate แล้วสั่งเปิด endDate
  useEffect(() => {
    if (startDate && !endDate) {
      // wait a tick before opening endRef
      setTimeout(() => {
        if (endRef.current) {
          if ("showPicker" in endRef.current) {
            endRef.current.showPicker(); // เบราว์เซอร์ที่รองรับ
          } else {
            console.log("Can not open");
          }
        }
      }, 100);
    }
  }, [startDate, endDate]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    onDateChange({ startDate: newStart, endDate: "" }); // เคลียร์ endDate
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange({ startDate, endDate: e.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
      <div
        className="appearance-none border-2 border-gray-400 rounded-lg p-2 bg-white w-full md:w-auto cursor-pointer"
        onClick={() =>
          startRef.current?.showPicker?.() || startRef.current?.focus()
        }
      >
        <input
          type="date"
          ref={startRef}
          className="w-full bg-transparent outline-none cursor-pointer"
          value={startDate}
          onChange={handleStartChange}
        />
      </div>

      <span className="text-gray-500 text-lg mx-2 md:mx-0">~</span>

      <div
        className={`appearance-none border-2 ${
          !startDate
            ? "border-gray-200 bg-gray-100 cursor-not-allowed"
            : "border-gray-400 bg-white cursor-pointer"
        } rounded-lg p-2 w-full md:w-auto`}
        onClick={() => {
          if (startDate) {
            endRef.current?.showPicker?.();
          }
        }}
      >
        <input
          type="date"
          ref={endRef}
          className="w-full bg-transparent outline-none disabled:cursor-not-allowed"
          value={endDate}
          onChange={handleEndChange}
          disabled={!startDate}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
