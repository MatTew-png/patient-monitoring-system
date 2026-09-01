import { Patient } from "../types/patient";
import { baseURL } from "./http";
import http from "./http";

export const patientService = {
  async loadAllPatientWait(): Promise<Patient[]> {
    try {
      const response = await http.get("patients/patientWait/all");
      return response.data;
    } catch (error) {
      console.error("Error loading patient wait:", error);
      throw error;
    }
  },

  // Function to load all patients with full details
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await http.get("patients/all/full_details");
      return response.data;
    } catch (error) {
      console.error("Error loading patients:", error);
      throw error;
    }
  },

  async getPatientInformation(patient_id: number): Promise<Patient> {
    try {
      const response = await http.get(
        `/patients/patient_information/${patient_id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error loading patients:", error);
      throw error;
    }
  },

  async getPatientWithDetail(patient_id: number): Promise<Patient> {
    const res = await http.get(`patients/${patient_id}/full_details`);
    return res.data;
  },

  // Function to edit patient details
  async editPatient(patient_id: number, patient: Patient): Promise<Patient> {
    try {
      const response = await http.patch(`patients/edit/${patient_id}`, patient);
      return response.data;
    } catch (error) {
      console.error("Error editing patient:", error);
      throw error;
    }
  },

  async deletePatient(patient_id: number) {
    const res = await http.delete(`patients/${patient_id}`);
    return res.data;
  },

  async addPatient(patient: Patient): Promise<Patient> {
    try {
      const response = await http.post("patients", patient);
      return response.data;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  },
  async addImageToPatient(formData: FormData, patient_id: number) {
    const res = await http.post(
      `${baseURL}patients/${patient_id}/upload_image`,
      formData
    );
    return res.data;
  },
};
