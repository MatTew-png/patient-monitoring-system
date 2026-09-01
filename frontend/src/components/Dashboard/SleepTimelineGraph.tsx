import React, { useEffect, useState, useRef, useMemo } from "react";
import Plot from "react-plotly.js";
import { format } from "date-fns";
import { usehistoryValueSensorStore } from "../../store/historyValueSensorStore";
import { Sensor } from "../../types/sensor";
import { History_Value_Sensor } from "../../types/history_value_sensor";

interface SleepTimelineGraphProps {
  sensor?: Sensor;
}

const SleepTimelineGraph: React.FC<SleepTimelineGraphProps> = ({ sensor }) => {
  const [sensorHistory, setSensorHistory] = useState<History_Value_Sensor[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const load1DayHistoryValue = usehistoryValueSensorStore(
    (state) => state.load1DayHistoryValue
  );

  // ✅ เก็บวันที่คงที่ตลอดการ render
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchData = async () => {
      if (!sensor) return;
      const formattedDate = format(today, "yyyy-MM-dd");
      const historyData = await load1DayHistoryValue(sensor.sensor_id, formattedDate);
      setSensorHistory(historyData);
    };
    fetchData();
  }, [sensor, load1DayHistoryValue, today]); // today คงที่แล้ว effect จะไม่รันซ้ำทุก render

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
      if (graphContainerRef.current) resizeObserver.unobserve(graphContainerRef.current);
    };
  }, []);

  const statusColors: { [key: string]: string } = {
    "ไม่อยู่ที่เตียง": "#c94f4f",
    "นั่งบนเตียง": "#facc15",
    "ตะแคงซ้าย": "#fde68a",
    "นอนหงาย": "#d9f99d",
    "ตะแคงขวา": "#86efac",
  };

  const filteredData = sensorHistory
    .filter((item) => item.history_value_sensor_time)
    .map((item) => ({
      time: String(item.history_value_sensor_time),
      position: item.history_value_sensor_value ?? "ไม่ระบุสถานะ",
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const shapes: Partial<Plotly.Shape>[] = filteredData.map((d, i) => {
    const start = new Date(d.time);
    const end = i + 1 < filteredData.length
      ? new Date(filteredData[i + 1].time)
      : new Date(today).setHours(23, 59, 59, 999);

    return {
      type: "rect" as const,
      xref: "x",
      yref: "paper",
      x0: start,
      x1: end,
      y0: 0,
      y1: 1,
      fillcolor: statusColors[d.position] || "#ccc",
      line: { width: 0 },
      layer: "below",
      opacity: 1,
    };
  });

  const traces: Plotly.Data[] = [
    {
      x: filteredData.map((d) => d.time),
      y: filteredData.map(() => 0.5),
      mode: "lines",
      type: "scatter",
      line: { color: "rgba(0,0,0,0)", width: 0.1 },
      hoverinfo: "x+text",
      text: filteredData.map(
        (d) => `สถานะ: ${d.position}\nเวลา: ${format(new Date(d.time), "HH:mm")}`
      ),
      showlegend: false,
    },
  ];

  return (
    <section id="sleepGraph" className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
      <h3 className="text-xl font-bold mb-4 text-[#2E5361]">Sleep Timeline</h3>

      <div
        id="graphCard"
        ref={graphContainerRef}
        className="h-[250px] border-2 border-gray-300 rounded-xl p-2"
      >
        <Plot
          data={traces}
          layout={{
            xaxis: {
              type: "date",
              range: [
                new Date(today).setHours(0, 0, 0, 0),
                new Date(today).setHours(23, 59, 59, 999),
              ],
              tickformat: "%H:%M",
              showgrid: true,
              gridcolor: "#e0e0e0",
            },
            yaxis: { range: [0, 1], showticklabels: false, fixedrange: true },
            shapes,
            margin: { l: 40, r: 40, t: 40, b: 40 },
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

      {/* Legend */}
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
            />
            <span className="text-base font-medium">{status}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SleepTimelineGraph;
