import {
  AppointmentData,
  CitaBackend,
  TimeSlot,
  TIME_SLOTS_CONFIG,
  PERIOD_LIMITS,
  normalizeHour,
  hourToMinutes,
} from "./types";
import { API_BASE_URL } from "./config";

/**
 * Normaliza una fecha que viene del Sheet: "12/2/2026" -> "12/02/2026"
 * Google Sheets a veces no padea dia/mes con cero.
 */
function normalizeDate(fecha: string): string {
  const parts = fecha.split("/");
  if (parts.length !== 3) return fecha;
  const [d, m, y] = parts;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

// ================================================================
// CONFIGURACION
// ================================================================

/**
 * Base URL de la API.
 * En desarrollo, Vite proxy redirige /api -> http://localhost:3000
 * En produccion, usa la variable de entorno VITE_API_URL
 */
const API_BASE = API_BASE_URL;

// ================================================================
// FUNCIONES PUBLICAS
// ================================================================

/**
 * Obtiene todas las citas activas desde el backend (Google Sheets).
 */
export async function fetchAllCitas(): Promise<CitaBackend[]> {
  const res = await fetch(`${API_BASE}/citas`);
  if (!res.ok) {
    throw new Error("Error al consultar citas del servidor");
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Error desconocido");
  }
  return json.data as CitaBackend[];
}

/**
 * Calcula la disponibilidad de horarios para una fecha, doctora y duracion dadas.
 * Descarga TODAS las citas y filtra en el frontend.
 *
 * Logica:
 * - Los slots son cada 30 minutos.
 * - Una cita de 30 min ocupa 1 slot; una cita de 60 min ocupa 2 slots consecutivos.
 * - Si la cita de 60 min se sale del periodo (mañana o tarde), no se permite.
 * - Se usa deteccion de solapamiento: [inicio_propuesto, fin_propuesto) vs [inicio_existente, fin_existente).
 * - Se incluyen citas "Activa" y "Reagendada" como ocupadas (ambas son citas vigentes).
 */
export async function getAvailability(
  date: string,
  doctorName: string,
  duration: number
): Promise<TimeSlot[]> {
  // date viene como DD/MM/AAAA
  const allCitas = await fetchAllCitas();

  const normalizedDate = normalizeDate(date);

  // Citas vigentes de ESTA doctora en esta fecha
  const citasDoctorEnFecha = allCitas.filter(
    (c) =>
      (c.estado === "Activa" || c.estado === "Reagendada") &&
      normalizeDate(c.fecha) === normalizedDate &&
      c.doctora === doctorName
  );

  // Armar la lista de slots con disponibilidad
  const allSlots = [
    ...TIME_SLOTS_CONFIG.morning.map((s) => ({
      ...s,
      period: "morning" as const,
    })),
    ...TIME_SLOTS_CONFIG.afternoon.map((s) => ({
      ...s,
      period: "afternoon" as const,
    })),
  ];

  return allSlots.map((slot) => {
    const slotStartMin = hourToMinutes(slot.hour);
    const slotEndMin = slotStartMin + duration;

    // ¿La cita propuesta cabe dentro del periodo (no se sale a almuerzo ni cierre)?
    const periodLimit = PERIOD_LIMITS[slot.period];
    if (slotEndMin > periodLimit.end) {
      return { ...slot, available: false, spotsLeft: 0 };
    }

    // ¿La doctora tiene alguna cita que se solape con el rango propuesto?
    const doctorConflict = citasDoctorEnFecha.some((cita) => {
      const citaStart = hourToMinutes(normalizeHour(cita.hora));
      // Para citas antiguas sin horaFin/duracion, asumir 60 min por seguridad
      const citaDuration = cita.duracion ? parseInt(cita.duracion) : 60;
      const citaEnd = cita.horaFin
        ? hourToMinutes(normalizeHour(cita.horaFin))
        : citaStart + citaDuration;

      // Solapamiento: [A, B) se solapa con [C, D) si A < D && C < B
      return slotStartMin < citaEnd && citaStart < slotEndMin;
    });

    const available = !doctorConflict;

    return {
      ...slot,
      available,
      spotsLeft: available ? 1 : 0,
    };
  });
}

/**
 * Crea una nueva cita en el backend.
 * El backend escribe en Google Sheets y crea evento en Google Calendar.
 */
export async function createAppointment(
  data: AppointmentData
): Promise<{ success: boolean; message: string; eventId?: string }> {
  const res = await fetch(`${API_BASE}/citas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cedula: data.cedula,
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      fecha: data.fecha, // DD/MM/AAAA
      hora: data.hora, // HH:MM (inicio)
      horaFin: data.horaFin, // HH:MM (fin)
      duracion: data.duracion, // 30 o 60
      servicio: data.servicio, // Nombre del servicio
      doctora: data.doctora, // Doctora asignada
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(
      errorJson?.message || `Error del servidor (${res.status})`
    );
  }

  return await res.json();
}

/**
 * Health check del backend.
 */
export async function checkHealth(): Promise<{
  status: string;
  google: string;
  spreadsheetId: string;
}> {
  const res = await fetch(`${API_BASE}/health`);
  return await res.json();
}
