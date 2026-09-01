import { create } from "zustand";
import { Patient } from "../types/patient";
import { patientService } from "../services/patientService";

interface PatientStore {
  patients: Patient[];
  loadPatientsWait: () => Promise<void>;
  getPatients: () => Promise<Patient[]>;
  removePatient: (patientId: number | undefined) => void; // Adjusted to number | undefined
  deletePatient: (patient_id: number) => void;
  addImageToPatient: (image: File, patient_id: number) => void;
  addPatient: (patient: Patient) => Promise<Patient>;
  editPatient: (patient: Patient) => void;
  getPatientWithDetail: (patient_id: number) => Promise<Patient>;
  getPatientInformation: (patient_id: number) => Promise<Patient>;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: [],
  loadPatientsWait: async () => {
    const res = await patientService.loadAllPatientWait();
    set({ patients: res });
  },
  removePatient: (patientId: number | undefined) => {
    set((state) => ({
      patients: state.patients.filter(
        (patient) => patient.patient_id !== patientId
      ),
    }));
  },
  deletePatient: async (patient_id: number) => {
    const res = await patientService.deletePatient(patient_id);
    console.log("deleted target", res);
  },
  getPatients: async () => {
    const res = await patientService.getPatients();
    return res as Patient[];
  },
  addImageToPatient: async (image: File, patient_id: number) => {
    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }

    await patientService.addImageToPatient(formData, patient_id);
  },
  addPatient: async (patient: Patient) => {
    const data = await patientService.addPatient(patient);
    return data;
  },
  editPatient: async (patient: Patient) => {
    await patientService.editPatient(patient.patient_id ?? 0, patient);
  },
  getPatientWithDetail: async (patient_id: number) => {
    const data = patientService.getPatientWithDetail(patient_id);
    return data;
  },
  getPatientInformation: async (patient_id: number) => {
    const data = patientService.getPatientInformation(patient_id);
    return data;
  },
}));
