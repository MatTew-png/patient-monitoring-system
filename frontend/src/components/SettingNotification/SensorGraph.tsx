import React, { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

interface SensorGraphProps {
  title: string;
  unit: string;
  color: string;
  data: { time: string; value: number }[];
  minValue?: number;
  maxValue?: number;
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

const SensorGraph: React.FC<SensorGraphProps> = ({
  title,
  unit,
  color,
  data,
  selectedDate,
  onDateChange,
}) => {
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
  const filteredData = data.filter((d) =>
    d.time.startsWith(formattedSelectedDate)
  );

  const aggregateData = (data: { time: string; value: number }[]) => {
    const grouped: { [key: string]: number[] } = {};
    data.forEach(({ time, value }) => {
      const dateObj = new Date(time);
      const hour = dateObj.getHours();
      const minute = Math.floor(dateObj.getMinutes() / 15) * 15;
      const key = `${hour}:${minute.toString().padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(value);
    });

    return Object.entries(grouped).map(([time, values]) => ({
      time: `${formattedSelectedDate} ${time}:00`,
      value: values.reduce((sum, val) => sum + val, 0) / values.length,
    }));
  };

  const aggregatedData = aggregateData(filteredData);
  const xValues = aggregatedData.map((d) => d.time);
  const yValues = aggregatedData.map((d) => d.value);

  const timeRanges = aggregatedData.map((d) => {
    const [_, timePart] = d.time.split(" ");
    const [hourStr, minStr] = timePart.split(":");
    let hour = parseInt(hourStr);
    let min = parseInt(minStr);
    const start = `${hour.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}`;
    min += 15;
    if (min >= 60) {
      min = 0;
      hour = (hour + 1) % 24;
    }
    const end = `${hour.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}`;
    return `${start} - ${end}`;
  });

  const hasData = aggregatedData.length > 0;
  const minPoint = hasData
    ? aggregatedData.reduce((prev, curr) =>
        curr.value < prev.value ? curr : prev
      )
    : null;
  const maxPoint = hasData
    ? aggregatedData.reduce((prev, curr) =>
        curr.value > prev.value ? curr : prev
      )
    : null;

  const [containerWidth, setContainerWidth] = useState(0);
  const graphContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-white rounded-lg p-3 shadow-md">
      <div className="px-2">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-md font-medium">วัน / เดือน / ปี</span>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => onDateChange(date!)}
              dateFormat="dd/MM/yyyy"
              locale={th}
              className="custom-date-picker p-2 border-1 rounded-xl text-center font-semibold shadow-md"
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
      </div>

      <div
        ref={graphContainerRef}
        className="bg-gradient-to-r from-white via-gray-100 to-white shadow-md even:bg-gradient-to-r even:from-[#A1B5BC] even:via-[#D1DFE5] even:to-[#e4ecef] rounded-lg w-full px-4"
        style={{ position: "relative", minHeight: 500 }}
      >
        {hasData ? (
          <Plot
            data={[
              {
                x: xValues,
                y: yValues,
                customdata: timeRanges,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: color, size: 7 },
                line: { shape: "spline", width: 4 },
                name: title,
                hovertemplate:
                  `<span style="font-size: 18px; color: #FFD8CD; font-weight: bold;">${title}</span><br><br>` +

                  `<span style="font-size: 16px; color: #FFFFFF;">📅 <span style="font-weight: bold;">วันที่:</span> %{x|%d/%m/%Y}</span><br>` +

                  `<br><span style="font-size: 16px; color: #FFFFFF;">🕒 <span style="font-weight: bold;">ช่วงเวลา:</span> %{customdata}</span><br>` +

                  `<br><span style="font-size: 16px; color: #FFF3D0;">📊 <span style="font-weight: bold;">ค่าเฉลี่ย:</span> <b>%{y:.2f} ${unit}</b></span><br>` +

                  `<extra></extra>`,
              },
              {
                x: xValues,
                y: Array(xValues.length).fill(minPoint!.value),
                type: "scatter",
                mode: "lines",
                line: { color: "orange", dash: "dash" },
                hoverinfo: "skip",
                showlegend: false,
              },
              {
                x: xValues,
                y: Array(xValues.length).fill(maxPoint!.value),
                type: "scatter",
                mode: "lines",
                line: { color: "orange", dash: "dash" },
                hoverinfo: "skip",
                showlegend: false,
              },
            ]}
            layout={{
              title: `${title} (${unit})`,
              font: { size: 16, color: "#000000", family: "Noto Serif Thai" },
              xaxis: {
                title: "เวลา",
                type: "date",
                range: [
                  `${formattedSelectedDate}T00:00:00.000Z`,
                  `${formattedSelectedDate}T23:59:59.999Z`,
                ],
                dtick: 7200000, // 2 ชั่วโมงเป็นมิลลิวินาที
                tickformat: "%H:%M น.",
                fixedrange: true,
                autorange: false,
                showgrid: true,
                gridcolor: "#e0e0e0",
              },
              yaxis: {
                title: `${title} (${unit})`,
                tickangle: 0,
                automargin: true,
                autorange: true,
              },
              annotations: [
                {
                  xref: "paper",
                  x: 0.5,
                  y: maxPoint!.value + maxPoint!.value * 0.05,
                  xanchor: "center",
                  text: "ค่าสูงสุด",
                  showarrow: false,
                  font: { size: 15, color: "#898686", family: "Arial Black" },
                },
                {
                  xref: "paper",
                  x: 0.5,
                  y: minPoint!.value - minPoint!.value * 0.05,
                  xanchor: "center",
                  text: "ค่าต่ำสุด",
                  showarrow: false,
                  font: { size: 15, color: "#898686", family: "Arial Black"},
                },
                {
                  xref: "paper",
                  yref: "paper",
                  x: 0,
                  y: 1.05,
                  xanchor: "left",
                  yanchor: "bottom",
                  text: unit,
                  showarrow: false,
                  font: { size: 14, color: "#000000", family: "Noto Serif Thai" },
                },
              ],
              legend: {
                orientation: "h",
                x: 0.5,
                y: -0.3,
                xanchor: "center",
                yanchor: "top",
              },
              height: 500,
              width: containerWidth > 0 ? containerWidth - 32 : undefined,
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              margin: { l: 80, r: 50, t: 80, b: 120 },
            }}
            config={{
              responsive: true,
            }}
            useResizeHandler
            style={{
              width: "100%",
              height: 500,
            }}
          />
        ) : (
          <div
            style={{
              height: 500,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#666",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            ไม่มีข้อมูลในวันนี้
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorGraph;
