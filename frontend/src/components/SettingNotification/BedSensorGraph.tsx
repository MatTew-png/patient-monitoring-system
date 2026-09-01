import React, { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

interface TimelineGraphProps {
  data: { time: string; position: string }[];
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

const TimelineGraph: React.FC<TimelineGraphProps> = ({
  data,
  selectedDate,
  onDateChange,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const statusColors: { [key: string]: string } = {
    "ไม่อยู่ที่เตียง": "#c94f4f",
    "นั่งบนเตียง": "#facc15",
    "ตะแคงซ้าย": "#fde68a",
    "นอนหงาย": "#d9f99d",
    "ตะแคงขวา": "#86efac",
  };

  useEffect(() => {
    if (!graphContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(graphContainerRef.current);
    setContainerWidth(graphContainerRef.current.offsetWidth);

    return () => {
      if (graphContainerRef.current) {
        resizeObserver.unobserve(graphContainerRef.current);
      }
    };
  }, []);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const filteredData = data
    .filter((d) => {
      const dt = new Date(d.time);
      return dt >= startOfDay && dt <= endOfDay;
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // กำหนด type เป็น Partial<Plotly.Shape>[]
  const shapes: Partial<Plotly.Shape>[] = filteredData.map((d, i) => {
    const start = new Date(d.time).getTime();
    const end =
      i + 1 < filteredData.length
        ? new Date(filteredData[i + 1].time).getTime()
        : endOfDay.getTime();

    const color = statusColors[d.position] || "#cccccc";

    return {
      type: "rect" as const,  // <-- ใช้ 'as const' บังคับ literal type
      xref: "x",
      yref: "paper",
      x0: new Date(start),
      x1: new Date(end),
      y0: 0,
      y1: 1,
      fillcolor: color,
      opacity: 1, // ปรับความชัดของสีตรงนี้
      line: { width: 0 },
      layer: "below",
    };
  });

  const traces: Plotly.Data[] = [
    {
      x: filteredData.map((d) => d.time),
      y: filteredData.map(() => 0.5),
      mode: "lines",
      type: "scatter",
      line: {
        color: "rgba(0,0,0,0)", // ล่องหน
        width: 0.1,
      },
      hoverinfo: "x+text",
      text: filteredData.map(
        (d) =>
          `สถานะ: ${d.position}<br>เวลา: ${format(new Date(d.time), "HH:mm")}`
      ),
      showlegend: false,
    },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-md font-medium">วัน / เดือน / ปี</span>
        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              if (date) onDateChange(date);
            }}
            dateFormat="dd/MM/yyyy"
            className="custom-date-picker p-2 border rounded-xl text-center font-semibold shadow-md"
          />
          <CalendarIcon className="absolute right-2 top-1.5 text-gray-500" />
        </div>

        <MdKeyboardDoubleArrowLeft
          onClick={() => onDateChange(subDays(selectedDate, 1))}
          style={{ marginLeft: 10, fontSize: 30, cursor: "pointer" }}
        />
        <MdKeyboardDoubleArrowRight
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          style={{ marginLeft: 5, fontSize: 30, cursor: "pointer" }}
        />
      </div>

      <div
        ref={graphContainerRef}
        className="h-[150px] border-2 border-gray-300 rounded-xl p-2
             bg-gradient-to-r from-white via-gray-100 to-white
             shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef]"

        style={{
          height: 150,
          border: "2px solid #ccc",
          borderRadius: 12,
          // backgroundColor: "#f8f9fa",
          padding: "0.5rem",
        }}
      >
        <Plot
          data={traces}
          layout={{
            title: "⏳ Timeline ของกิจกรรม (แกน Y เดียว สีซ้อน)",
            font: { size: 16, color: "#000000", family: "Noto Serif Thai" },
            xaxis: {
              title: "เวลา",
              type: "date",
              range: [
                `${formattedSelectedDate}T00:00:00.000Z`,
                `${formattedSelectedDate}T23:59:59.999Z`,
              ],
              zeroline: false,
              dtick: 7200000,
              tickformat: "%H:%M น.",
              showgrid: true,
              gridcolor: "#e0e0e0",
            },
            yaxis: {
              title: "",
              range: [0, 1],
              showticklabels: false,
              fixedrange: true,
              showgrid: false,
              zeroline: false,
            },
            shapes,
            margin: { l: 40, r: 40, t: 60, b: 40 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            height: 150,
            width: containerWidth > 0 ? containerWidth - 32 : undefined,
          }}
          config={{ responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              style={{
                
                width: 20,
                height: 20,
                backgroundColor: color,
                borderRadius: 4,
              }}
            ></div>
            <span className="text-base font-medium">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineGraph;
