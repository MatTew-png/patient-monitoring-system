import { Patient } from "../types/patient";
import { baseURL } from "./http";
import http from "./http";
import { MOCK_PATIENTS } from "./mockData";

export const patientService = {
  async loadAllPatientWait(): Promise<Patient[]> {
    try {
      const response = await http.get("patients/patientWait/all");
      return response.data?.length ? response.data : MOCK_PATIENTS;
    } catch {
      return MOCK_PATIENTS;
    }
  },

  async getPatients(): Promise<Patient[]> {
    try {
      const response = await http.get("patients/all/full_details");
      return response.data?.length ? response.data : MOCK_PATIENTS;
    } catch {
      return MOCK_PATIENTS;
    }
  },

  async getPatientInformation(patient_id: number): Promise<Patient> {
    try {
      const response = await http.get(`/patients/patient_information/${patient_id}`);
      return response.data || MOCK_PATIENTS.find((p) => p.patient_id === Number(patient_id)) || MOCK_PATIENTS[0];
    } catch {
      return MOCK_PATIENTS.find((p) => p.patient_id === Number(patient_id)) || MOCK_PATIENTS[0];
    }
  },

  async getPatientWithDetail(patient_id: number): Promise<Patient> {
    try {
      const res = await http.get(`patients/${patient_id}/full_details`);
      return res.data || MOCK_PATIENTS.find((p) => p.patient_id === Number(patient_id)) || MOCK_PATIENTS[0];
    } catch {
      return MOCK_PATIENTS.find((p) => p.patient_id === Number(patient_id)) || MOCK_PATIENTS[0];
    }
  },

  async editPatient(patient_id: number, patient: Patient): Promise<Patient> {
    try {
      const response = await http.patch(`patients/edit/${patient_id}`, patient);
      return response.data;
    } catch {
      return patient;
    }
  },

  async deletePatient(patient_id: number) {
    try {
      const res = await http.delete(`patients/${patient_id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async addPatient(patient: Patient): Promise<Patient> {
    try {
      const response = await http.post("patients", patient);
      return response.data;
    } catch {
      return patient;
    }
  },

  async addImageToPatient(formData: FormData, patient_id: number) {
    try {
      const res = await http.post(
        `${baseURL}patients/${patient_id}/upload_image`,
        formData
      );
      return res.data;
    } catch {
      return { success: true };
    }
  },
};
