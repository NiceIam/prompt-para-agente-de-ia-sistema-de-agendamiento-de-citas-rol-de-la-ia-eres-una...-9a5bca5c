export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface TimeSlot {
  hour: string;
  label: string;
  period: "morning" | "afternoon";
  available: boolean;
  spotsLeft: number;
}

export interface PatientData {
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface AppointmentData extends PatientData {
  fecha: string;
  hora: string;
  doctora: string;
  estado: string;
  fechaCreacion: string;
}

export const DOCTORS: Doctor[] = [
  { id: "dra-martinez", name: "Dra. Martínez", specialty: "Medicina General" },
  { id: "dra-rodriguez", name: "Dra. Rodríguez", specialty: "Medicina General" },
];

export const TIME_SLOTS_CONFIG = {
  morning: [
    { hour: "08:00", label: "8:00 AM" },
    { hour: "09:00", label: "9:00 AM" },
    { hour: "10:00", label: "10:00 AM" },
    { hour: "11:00", label: "11:00 AM" },
  ],
  afternoon: [
    { hour: "14:00", label: "2:00 PM" },
    { hour: "15:00", label: "3:00 PM" },
    { hour: "16:00", label: "4:00 PM" },
    { hour: "17:00", label: "5:00 PM" },
  ],
};

export const MAX_APPOINTMENTS_PER_SLOT = 2;
