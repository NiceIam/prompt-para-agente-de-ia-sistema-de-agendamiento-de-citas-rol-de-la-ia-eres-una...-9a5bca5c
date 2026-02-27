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
      { id: "procedimiento-dental", name: "Procedimiento dental", duration: 90 },
    ],
  },
  {
    id: "ortopedia-maxilar",
    name: "Ortopedia Maxilar",
    doctorId: "dra-sandra",
    appointmentTypes: [
      { id: "valoracion-ortopedia", name: "Valoración", duration: 30 },
      { id: "procedimiento-ortopedia", name: "Procedimiento de Ortopedia", duration: 60 },
      { id: "control-ortopedia", name: "Control de ortopedia", duration: 30 },
    ],
  },
  {
    id: "odontologia-general",
    name: "Odontología General",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-general", name: "Valoración General", duration: 30 },
      { id: "procedimiento-general", name: "Procedimiento General", duration: 60 },
      { id: "mantenimiento-diseno", name: "Mantenimiento de diseño", duration: 120 },
    ],
  },
  {
    id: "odontologia-estetica",
    name: "Odontología Estética",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-estetica", name: "Valoración", duration: 30 },
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
    ],
  },
  {
    id: "rehabilitacion-oral",
    name: "Rehabilitación Oral",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-rehabilitacion", name: "Valoración", duration: 30 },
    ],
  },
  {
    id: "periodoncia",
    name: "Periodoncia",
    doctorId: "dra-zaira",
    appointmentTypes: [
      { id: "valoracion-periodoncia", name: "Valoración", duration: 30 },
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
  ],
};

/**
 * Límites de los periodos (en minutos desde medianoche).
 * Solo Lunes a Viernes. Última cita de la tarde a las 17:00 (5:00 PM).
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
 * - Es sábado o domingo (solo se atiende Lunes a Viernes)
 * - Es festivo
 * - Es fecha pasada
 */
export function isDateDisabled(date: Date): boolean {
  const day = date.getDay();

  // Domingo
  if (day === 0) return true;

  // Sábado (la clínica solo atiende Lunes a Viernes)
  if (day === 6) return true;

  const ddmmyyyy = dateToDDMMYYYY(date);

  // Festivo
  if (HOLIDAYS_2026.includes(ddmmyyyy)) return true;

  // Fecha pasada
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return true;

  return false;
}

// ================================================================
// EXCEPCIONES POR DOCTORA (fechas sin atención)
// ================================================================

/** Dra. Sandra Simancas no atiende del 19 al 25 de febrero de 2026 */
const DR_SANDRA_UNAVAILABLE_START = new Date(2026, 1, 19);
const DR_SANDRA_UNAVAILABLE_END = new Date(2026, 1, 25);

/**
 * Devuelve true si la fecha NO se puede agendar para la doctora indicada.
 * Usa las reglas generales (isDateDisabled) y además bloquea excepciones por doctora.
 */
export function isDateDisabledForDoctor(
  date: Date,
  doctorId: string | undefined
): boolean {
  if (isDateDisabled(date)) return true;

  // Excepción: Dra. Sandra no atiende del 19 al 25 de febrero 2026
  if (doctorId === "dra-sandra") {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(DR_SANDRA_UNAVAILABLE_START.getFullYear(), DR_SANDRA_UNAVAILABLE_START.getMonth(), DR_SANDRA_UNAVAILABLE_START.getDate());
    const end = new Date(DR_SANDRA_UNAVAILABLE_END.getFullYear(), DR_SANDRA_UNAVAILABLE_END.getMonth(), DR_SANDRA_UNAVAILABLE_END.getDate());
    if (d >= start && d <= end) return true;
  }

  return false;
}
