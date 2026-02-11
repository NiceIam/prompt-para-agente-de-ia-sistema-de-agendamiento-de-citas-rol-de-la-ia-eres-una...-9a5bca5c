import { AppointmentData, TimeSlot, TIME_SLOTS_CONFIG, MAX_APPOINTMENTS_PER_SLOT } from "./types";

// Replace with your Google Apps Script Web App URL
const API_URL = "";

const USE_MOCK = !API_URL;

// Mock data for development
const mockAppointments: AppointmentData[] = [];

export async function getAvailability(
  doctorId: string,
  date: string
): Promise<TimeSlot[]> {
  if (USE_MOCK) {
    return getMockAvailability(doctorId, date);
  }

  try {
    const res = await fetch(`${API_URL}?action=availability&doctor=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error("Error al consultar disponibilidad");
    return await res.json();
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw new Error("No se pudo consultar la disponibilidad. Intente nuevamente.");
  }
}

export async function createAppointment(data: AppointmentData): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    return createMockAppointment(data);
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...data }),
    });
    if (!res.ok) throw new Error("Error al crear la cita");
    return await res.json();
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new Error("No se pudo agendar la cita. Intente nuevamente.");
  }
}

function getMockAvailability(doctorId: string, date: string): TimeSlot[] {
  const allSlots = [
    ...TIME_SLOTS_CONFIG.morning.map((s) => ({ ...s, period: "morning" as const })),
    ...TIME_SLOTS_CONFIG.afternoon.map((s) => ({ ...s, period: "afternoon" as const })),
  ];

  return allSlots.map((slot) => {
    const count = mockAppointments.filter(
      (a) => a.doctora === doctorId && a.fecha === date && a.hora === slot.hour
    ).length;
    return {
      ...slot,
      available: count < MAX_APPOINTMENTS_PER_SLOT,
      spotsLeft: MAX_APPOINTMENTS_PER_SLOT - count,
    };
  });
}

function createMockAppointment(data: AppointmentData): { success: boolean; message: string } {
  const count = mockAppointments.filter(
    (a) => a.doctora === data.doctora && a.fecha === data.fecha && a.hora === data.hora
  ).length;

  if (count >= MAX_APPOINTMENTS_PER_SLOT) {
    return { success: false, message: "Este horario ya no está disponible." };
  }

  mockAppointments.push(data);
  return { success: true, message: "Cita agendada exitosamente." };
}
