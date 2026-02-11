// ================================================================
// TIPOS
// ================================================================

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // minutos (30 o 60)
}

export interface ServiceCategory {
  id: string;
  name: string;
  doctorId: string;
  appointmentTypes: AppointmentType[];
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
  hora: string; // HH:MM (24h) - hora inicio
  horaFin: string; // HH:MM (24h) - hora fin
  duracion: number; // minutos (30 o 60)
  servicio: string; // nombre completo del servicio
  doctora: string; // nombre de la doctora asignada
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
  servicio: string; // nombre del servicio
  horaFin: string; // HH:MM hora de finalizacion
  duracion: string; // duracion en minutos como string
}

// ================================================================
// DOCTORAS
// ================================================================

export const DOCTORS: Doctor[] = [
  {
    id: "dra-sandra",
    name: "Dra. Sandra Simancas",
    specialty: "Ortodoncia y Ortopedia Maxilar",
  },
  {
    id: "dra-zaira",
    name: "Dra. Zaira de Oro Romeo",
    specialty: "Odontología General",
  },
];

// ================================================================
// SERVICIOS
// ================================================================

export const SERVICES: ServiceCategory[] = [
  {
    id: "ortodoncia",
    name: "Ortodoncia",
    doctorId: "dra-sandra",
    appointmentTypes: [
      { id: "valoracion-ortodoncia", name: "Valoración de Ortodoncia", duration: 30 },
      { id: "control-ortodoncia", name: "Control de Ortodoncia", duration: 30 },
      { id: "montaje-brackets", name: "Montaje de Brackets", duration: 60 },
    ],
  },
  {
    id: "ortopedia-maxilar",
    name: "Ortopedia Maxilar",
    doctorId: "dra-sandra",
    appointmentTypes: [
      { id: "valoracion-ortopedia", name: "Valoración", duration: 30 },
      { id: "procedimiento-ortopedia", name: "Procedimiento de Ortopedia", duration: 60 },
    ],
  },
  {
    id: "odontologia-general",
    name: "Odontología General",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-general", name: "Valoración General", duration: 30 },
      { id: "procedimiento-general", name: "Procedimiento General", duration: 60 },
    ],
  },
  {
    id: "odontologia-estetica",
    name: "Odontología Estética",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-estetica", name: "Valoración", duration: 30 },
      { id: "procedimiento-estetico", name: "Procedimiento Estético", duration: 60 },
    ],
  },
  {
    id: "blanqueamiento",
    name: "Blanqueamiento",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "blanqueamiento", name: "Blanqueamiento Dental", duration: 60 },
    ],
  },
  {
    id: "diseno-sonrisa",
    name: "Diseño de Sonrisa",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-diseno", name: "Valoración", duration: 30 },
      { id: "diseno-sonrisa-proc", name: "Diseño de Sonrisa", duration: 60 },
    ],
  },
  {
    id: "rehabilitacion-oral",
    name: "Rehabilitación Oral",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-rehabilitacion", name: "Valoración", duration: 30 },
      { id: "procedimiento-rehabilitacion", name: "Procedimiento de Rehabilitación", duration: 60 },
    ],
  },
  {
    id: "periodoncia",
    name: "Periodoncia",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-periodoncia", name: "Valoración", duration: 30 },
      { id: "procedimiento-periodoncia", name: "Procedimiento de Periodoncia", duration: 60 },
    ],
  },
  {
    id: "profilaxis",
    name: "Profilaxis",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "profilaxis", name: "Profilaxis (Limpieza Dental)", duration: 30 },
    ],
  },
];

/** Busca la doctora asignada a un servicio */
export function getDoctorForService(serviceId: string): Doctor | undefined {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return undefined;
  return DOCTORS.find((d) => d.id === service.doctorId);
}

// ================================================================
// HORARIOS (cada 30 minutos)
// ================================================================

export const TIME_SLOTS_CONFIG = {
  morning: [
    { hour: "08:00", label: "8:00 AM" },
    { hour: "08:30", label: "8:30 AM" },
    { hour: "09:00", label: "9:00 AM" },
    { hour: "09:30", label: "9:30 AM" },
    { hour: "10:00", label: "10:00 AM" },
    { hour: "10:30", label: "10:30 AM" },
    { hour: "11:00", label: "11:00 AM" },
    { hour: "11:30", label: "11:30 AM" },
  ],
  afternoon: [
    { hour: "14:00", label: "2:00 PM" },
    { hour: "14:30", label: "2:30 PM" },
    { hour: "15:00", label: "3:00 PM" },
    { hour: "15:30", label: "3:30 PM" },
    { hour: "16:00", label: "4:00 PM" },
    { hour: "16:30", label: "4:30 PM" },
    { hour: "17:00", label: "5:00 PM" },
    { hour: "17:30", label: "5:30 PM" },
  ],
};

/**
 * Limites de los periodos (en minutos desde medianoche).
 * Se usa para validar que una cita no se salga del horario laboral.
 *   Mañana: 8:00 (480) a 12:00 (720)
 *   Tarde:  14:00 (840) a 18:00 (1080)
 */
export const PERIOD_LIMITS = {
  morning: { start: 480, end: 720 },
  afternoon: { start: 840, end: 1080 },
};

/** Maximo 2 citas por horario (2 doctoras trabajando simultáneamente) */
export const MAX_APPOINTMENTS_PER_SLOT = 2;

// ================================================================
// UTILIDADES DE TIEMPO
// ================================================================

/** Convierte "HH:MM" a minutos desde medianoche */
export function hourToMinutes(hour: string): number {
  const [h, m] = hour.split(":").map(Number);
  return h * 60 + m;
}

/** Convierte minutos desde medianoche a "HH:MM" */
export function minutesToHour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Convierte minutos desde medianoche a label legible "8:00 AM" */
export function minutesToLabel(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

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
