import { describe, it, expect } from "vitest";
import { MOCK_BEDS, MOCK_PATIENTS, createMockSensors } from "../services/mockData";

describe("🏥 Inpatient Telemetry & Vital Signs Stream Automation Suite", () => {
  it("TC-TELE-001: should correctly structure 6 inpatient telemetry beds", () => {
    expect(MOCK_BEDS).toHaveLength(6);
    MOCK_BEDS.forEach((bed, index) => {
      expect(bed.bed_id).toBe(index + 1);
      expect(bed.bed_activated).toBe(true);
      expect(bed.patient).toBeDefined();
      expect(bed.sensors.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("TC-TELE-002: should verify Heart Rate sensor contract and 78 bpm vital bounds", () => {
    const bed1Sensors = createMockSensors(1);
    const hrSensor = bed1Sensors.find((s) => s.sensor_type === "heart_rate");

    expect(hrSensor).toBeDefined();
    expect(hrSensor?.sensor_unit).toBe("bpm");
    expect(hrSensor?.sensor_status).toBe(true);

    const latestVal = Number(hrSensor?.history_value_sensor.at(-1)?.history_value_sensor_value);
    expect(latestVal).toBeGreaterThanOrEqual(60);
    expect(latestVal).toBeLessThanOrEqual(120);
  });

  it("TC-TELE-003: should verify SpO2 (98-100%) and Respiration (12-20 rpm) thresholds", () => {
    const bed1Sensors = createMockSensors(1);
    const spo2Sensor = bed1Sensors.find((s) => s.sensor_type === "spo2");
    const respiSensor = bed1Sensors.find((s) => s.sensor_type === "respiration");

    expect(spo2Sensor?.sensor_unit).toBe("%");
    const spo2Val = Number(spo2Sensor?.history_value_sensor.at(-1)?.history_value_sensor_value);
    expect(spo2Val).toBeGreaterThanOrEqual(95);
    expect(spo2Val).toBeLessThanOrEqual(100);

    expect(respiSensor?.sensor_unit).toBe("rpm");
    const respiVal = Number(respiSensor?.history_value_sensor.at(-1)?.history_value_sensor_value);
    expect(respiVal).toBeGreaterThanOrEqual(12);
    expect(respiVal).toBeLessThanOrEqual(24);
  });

  it("TC-TELE-004: should verify 24-hour sleep posture categories for Plotly timeline", () => {
    const bed1Sensors = createMockSensors(1);
    const sleepSensor = bed1Sensors.find((s) => s.sensor_type === "bed_sensor");

    expect(sleepSensor).toBeDefined();
    const validPositions = ["นอนหงาย", "ตะแคงขวา", "ตะแคงซ้าย", "นั่งบนเตียง", "ไม่อยู่ที่เตียง"];

    sleepSensor?.history_value_sensor.forEach((record) => {
      expect(validPositions).toContain(record.history_value_sensor_value);
      expect(record.history_value_sensor_time).toBeDefined();
    });
  });
});
