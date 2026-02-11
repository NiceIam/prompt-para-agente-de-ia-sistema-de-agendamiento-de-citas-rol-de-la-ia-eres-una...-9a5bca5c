import {
  AppointmentData,
  CitaBackend,
  TimeSlot,
  TIME_SLOTS_CONFIG,
  MAX_APPOINTMENTS_PER_SLOT,
  normalizeHour,
} from "./types";

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
 * En produccion, cambiar a la URL del servidor desplegado.
 */
const API_BASE = "/api";

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
 * Calcula la disponibilidad de horarios para una fecha y doctora dadas.
 * Descarga TODAS las citas y filtra en el frontend.
 *
 * Logica:
 * - Cada doctora puede tener MAXIMO 1 cita por horario.
 * - Si la doctora seleccionada ya tiene cita a esa hora -> NO disponible.
 * - Si ambas doctoras tienen cita a esa hora -> slot lleno para todos.
 */
export async function getAvailability(
  date: string,
  doctorName: string
): Promise<TimeSlot[]> {
  // date viene como DD/MM/AAAA
  const allCitas = await fetchAllCitas();

  // Filtrar solo citas activas para esa fecha (normalizar por si el Sheet no padea)
  const normalizedDate = normalizeDate(date);
  const citasEnFecha = allCitas.filter(
    (c) => c.estado === "Activa" && normalizeDate(c.fecha) === normalizedDate
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
    // Citas de ESTA doctora en este horario
    const citasDoctora = citasEnFecha.filter(
      (c) => normalizeHour(c.hora) === slot.hour && c.doctora === doctorName
    ).length;

    // Total de citas en este horario (ambas doctoras)
    const citasTotal = citasEnFecha.filter(
      (c) => normalizeHour(c.hora) === slot.hour
    ).length;

    // La doctora NO esta disponible si ya tiene 1 cita a esa hora
    // El slot esta completamente lleno si ya hay 2 citas (ambas doctoras ocupadas)
    const doctoraBusy = citasDoctora >= 1;
    const slotFull = citasTotal >= MAX_APPOINTMENTS_PER_SLOT;
    const available = !doctoraBusy && !slotFull;

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
      cedula: data.cedula, // Numero de identificacion del paciente
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      fecha: data.fecha, // DD/MM/AAAA
      hora: data.hora, // HH:MM
      doctora: data.doctora, // Doctora seleccionada
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
