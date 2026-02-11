// ================================================================
// TIPOS
// ================================================================

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
  fecha: string; // DD/MM/AAAA
  hora: string; // HH:MM (24h)
  doctora: string; // Nombre de la doctora seleccionada
}

/** Cita tal como llega del backend (GET /api/citas) */
export interface CitaBackend {
  id: string;
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  fecha: string; // DD/MM/AAAA
  hora: string; // HH:MM (puede venir sin cero: "9:00")
  estado: string;
  accion: string;
  doctora: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================================
// DOCTORAS
// ================================================================

export const DOCTORS: Doctor[] = [
  { id: "dra-martinez", name: "Dra. Martínez", specialty: "Ortodoncia" },
  { id: "dra-rodriguez", name: "Dra. Rodríguez", specialty: "Odontología General" },
];

// ================================================================
// HORARIOS
// ================================================================

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

/** Maximo 2 citas por horario (2 doctoras) */
export const MAX_APPOINTMENTS_PER_SLOT = 2;

// ================================================================
// FESTIVOS COLOMBIA 2026
// ================================================================

export const HOLIDAYS_2026: string[] = [
  "01/01/2026",
  "12/01/2026",
  "23/03/2026",
  "02/04/2026",
  "03/04/2026",
  "01/05/2026",
  "18/05/2026",
  "15/06/2026",
  "22/06/2026",
  "29/06/2026",
  "20/07/2026",
  "07/08/2026",
  "17/08/2026",
  "12/10/2026",
  "02/11/2026",
  "16/11/2026",
  "08/12/2026",
  "25/12/2026",
];

// ================================================================
// SABADOS NO LABORABLES 2026
// (la clinica trabaja sabados alternos; estos son los que NO trabaja)
// ================================================================

export const NON_WORKING_SATURDAYS_2026: string[] = [
  "14/02/2026",
  "28/02/2026",
  "14/03/2026",
  "28/03/2026",
  "11/04/2026",
  "25/04/2026",
  "09/05/2026",
  "23/05/2026",
  "06/06/2026",
  "20/06/2026",
  "04/07/2026",
  "18/07/2026",
  "01/08/2026",
  "15/08/2026",
  "29/08/2026",
  "12/09/2026",
  "26/09/2026",
  "10/10/2026",
  "24/10/2026",
  "07/11/2026",
  "21/11/2026",
  "05/12/2026",
  "19/12/2026",
];

// ================================================================
// UTILIDADES DE FECHA
// ================================================================

/** Convierte un Date de JS a string DD/MM/AAAA */
export function dateToDDMMYYYY(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString();
  return `${d}/${m}/${y}`;
}

/** Normaliza hora: "9:00" -> "09:00" */
export function normalizeHour(hora: string): string {
  const [h, m] = hora.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

/**
 * Devuelve true si la fecha NO se puede agendar:
 * - Es domingo
 * - Es festivo
 * - Es sabado no laborable
 * - Es fecha pasada
 */
export function isDateDisabled(date: Date): boolean {
  const day = date.getDay();

  // Domingo
  if (day === 0) return true;

  const ddmmyyyy = dateToDDMMYYYY(date);

  // Festivo
  if (HOLIDAYS_2026.includes(ddmmyyyy)) return true;

  // Sabado no laborable
  if (day === 6 && NON_WORKING_SATURDAYS_2026.includes(ddmmyyyy)) return true;

  // Fecha pasada
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return true;

  return false;
}
