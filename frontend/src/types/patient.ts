import { Bed } from "./bed";

export interface Patient {
  patient_id?: number;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  patient_dob?: string;
  patient_disease?: string;
  patient_status?: string;
  patient_date_in?: string;
  patient_bloodtype?: string;
  image_path?: string;
  bed?: Bed;
}
