import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import { ServiceSelect } from "@/components/ServiceSelect";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { PatientForm } from "@/components/PatientForm";
import { Confirmation } from "@/components/Confirmation";
import { useToast } from "@/hooks/use-toast";
import {
  ServiceCategory,
  AppointmentType,
  PatientData,
  TimeSlot,
  TIME_SLOTS_CONFIG,
  dateToDDMMYYYY,
  getDoctorForService,
  hourToMinutes,
  minutesToHour,
  minutesToLabel,
} from "@/lib/types";
import { getAvailability, createAppointment } from "@/lib/api";

const STEPS = ["Servicio y Fecha", "Horario", "Datos"];

export default function Index() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Step 1: servicio, tipo de cita, fecha
  const [selectedService, setSelectedService] =
    useState<ServiceCategory | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] =
    useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Step 2: horario
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3: datos
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [patientName, setPatientName] = useState("");

  // Doctora auto-asignada
  const doctor = selectedService
    ? getDoctorForService(selectedService.id)
    : null;

  // Duracion de la cita seleccionada
  const duration = selectedAppointmentType?.duration ?? 30;

  // ----------------------------------------------------------
  // Cargar disponibilidad cuando se pasa al paso 2
  // ----------------------------------------------------------

  const fetchSlots = useCallback(async () => {
    if (!doctor || !selectedDate || !selectedAppointmentType) return;
    setLoadingSlots(true);
    try {
      const fechaStr = dateToDDMMYYYY(selectedDate);
      const data = await getAvailability(
        fechaStr,
        doctor.name,
        selectedAppointmentType.duration
      );
      setSlots(data);
    } catch {
      toast({
        title: "Error",
        description:
          "No se pudo cargar la disponibilidad. Verifica que el servidor esté activo.",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  }, [doctor, selectedDate, selectedAppointmentType, toast]);

  useEffect(() => {
    if (step === 2) fetchSlots();
  }, [step, fetchSlots]);

  // ----------------------------------------------------------
  // Navegacion
  // ----------------------------------------------------------

  const canGoToStep2 =
    selectedService && selectedAppointmentType && selectedDate;

  const handleNext = () => {
    if (step === 1 && canGoToStep2) setStep(2);
    else if (step === 2 && selectedSlot) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedSlot(null);
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // ----------------------------------------------------------
  // Resetear tipo de cita al cambiar servicio
  // ----------------------------------------------------------

  const handleSelectService = (service: ServiceCategory) => {
    setSelectedService(service);
    setSelectedAppointmentType(null);
    setSelectedSlot(null);
  };

  const handleSelectAppointmentType = useCallback((type: AppointmentType) => {
    setSelectedAppointmentType(type);
    setSelectedSlot(null);
  }, []);

  // ----------------------------------------------------------
  // Enviar cita
  // ----------------------------------------------------------

  const handleSubmit = async (data: PatientData) => {
    if (!doctor || !selectedDate || !selectedSlot || !selectedService || !selectedAppointmentType)
      return;
    setSubmitting(true);
    try {
      const horaFin = minutesToHour(
        hourToMinutes(selectedSlot) + selectedAppointmentType.duration
      );
      const servicioLabel = `${selectedService.name} - ${selectedAppointmentType.name}`;

      const result = await createAppointment({
        cedula: data.cedula,
        nombre: data.nombre,
        correo: data.correo,
        telefono: data.telefono,
        fecha: dateToDDMMYYYY(selectedDate),
        hora: selectedSlot,
        horaFin,
        duracion: selectedAppointmentType.duration,
        servicio: servicioLabel,
        doctora: doctor.name,
      });

      if (result.success) {
        setPatientName(data.nombre);
        setConfirmed(true);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo agendar la cita. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // Reiniciar
  // ----------------------------------------------------------

  const resetAll = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedAppointmentType(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSlots([]);
    setConfirmed(false);
    setPatientName("");
  };

  // ----------------------------------------------------------
  // Labels
  // ----------------------------------------------------------

  const getSlotLabel = (hour: string) => {
    const all = [...TIME_SLOTS_CONFIG.morning, ...TIME_SLOTS_CONFIG.afternoon];
    return all.find((s) => s.hour === hour)?.label ?? hour;
  };

  const getTimeRangeLabel = (hour: string) => {
    const startMin = hourToMinutes(hour);
    const endMin = startMin + duration;
    return `${minutesToLabel(startMin)} - ${minutesToLabel(endMin)}`;
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <CalendarHeart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-foreground leading-tight">
              Agenda tu Cita
            </h1>
            <p className="text-xs text-muted-foreground">Clínica Orthodonto</p>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        {confirmed ? (
          <Confirmation
            serviceName={
              selectedService && selectedAppointmentType
                ? `${selectedService.name} - ${selectedAppointmentType.name}`
                : ""
            }
            doctorName={doctor?.name ?? ""}
            date={format(selectedDate!, "d 'de' MMMM, yyyy", { locale: es })}
            time={getTimeRangeLabel(selectedSlot!)}
            duration={duration}
            patientName={patientName}
            onNewAppointment={resetAll}
          />
        ) : (
          <>
            <StepIndicator currentStep={step} steps={STEPS} />

            {/* Step content */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              {step === 1 && (
                <ServiceSelect
                  selectedService={selectedService}
                  selectedAppointmentType={selectedAppointmentType}
                  selectedDate={selectedDate}
                  onSelectService={handleSelectService}
                  onSelectAppointmentType={handleSelectAppointmentType}
                  onSelectDate={setSelectedDate}
                />
              )}
              {step === 2 && (
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={loadingSlots}
                  duration={duration}
                />
              )}
              {step === 3 && (
                <PatientForm onSubmit={handleSubmit} loading={submitting} />
              )}

              {/* Navigation */}
              {!confirmed && (
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  {step > 1 ? (
                    <Button variant="ghost" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < 3 && (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !canGoToStep2) ||
                        (step === 2 && !selectedSlot)
                      }
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
