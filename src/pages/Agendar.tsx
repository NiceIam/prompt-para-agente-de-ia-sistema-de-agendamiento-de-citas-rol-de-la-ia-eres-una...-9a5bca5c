import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import { DoctorSelect } from "@/components/DoctorSelect";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { PatientForm } from "@/components/PatientForm";
import { Confirmation } from "@/components/Confirmation";
import { useToast } from "@/hooks/use-toast";
import { Doctor, PatientData, TimeSlot, TIME_SLOTS_CONFIG, dateToDDMMYYYY } from "@/lib/types";
import { getAvailability, createAppointment } from "@/lib/api";

const STEPS = ["Doctora y Fecha", "Horario", "Datos"];

export default function Index() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [patientName, setPatientName] = useState("");

  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLoadingSlots(true);
    try {
      // Convertir la fecha a DD/MM/AAAA y pasar el nombre de la doctora
      const fechaStr = dateToDDMMYYYY(selectedDate);
      const data = await getAvailability(fechaStr, selectedDoctor.name);
      setSlots(data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad. Verifica que el servidor esté activo.",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate, toast]);

  useEffect(() => {
    if (step === 2) fetchSlots();
  }, [step, fetchSlots]);

  const canGoToStep2 = selectedDoctor && selectedDate;

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

  const handleSubmit = async (data: PatientData) => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      const result = await createAppointment({
        cedula: data.cedula, // Numero de identificacion del paciente
        nombre: data.nombre,
        correo: data.correo,
        telefono: data.telefono,
        fecha: dateToDDMMYYYY(selectedDate), // DD/MM/AAAA
        hora: selectedSlot, // HH:MM (24h)
        doctora: selectedDoctor.name, // Nombre de la doctora seleccionada
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

  const resetAll = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSlots([]);
    setConfirmed(false);
    setPatientName("");
  };

  const getSlotLabel = (hour: string) => {
    const all = [...TIME_SLOTS_CONFIG.morning, ...TIME_SLOTS_CONFIG.afternoon];
    return all.find((s) => s.hour === hour)?.label ?? hour;
  };

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
            doctor={selectedDoctor!}
            date={format(selectedDate!, "d 'de' MMMM, yyyy", { locale: es })}
            time={getSlotLabel(selectedSlot!)}
            patientName={patientName}
            onNewAppointment={resetAll}
          />
        ) : (
          <>
            <StepIndicator currentStep={step} steps={STEPS} />

            {/* Step content */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              {step === 1 && (
                <DoctorSelect
                  selectedDoctor={selectedDoctor}
                  selectedDate={selectedDate}
                  onSelectDoctor={setSelectedDoctor}
                  onSelectDate={setSelectedDate}
                />
              )}
              {step === 2 && (
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={loadingSlots}
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
