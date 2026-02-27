import { useEffect } from "react";
import {
  Smile,
  Shield,
  Stethoscope,
  Sparkles,
  Sun,
  Palette,
  HeartPulse,
  Activity,
  Droplets,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ServiceCategory,
  AppointmentType,
  SERVICES,
  getDoctorForService,
  isDateDisabledForDoctor,
} from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

// ================================================================
// ICONOS POR SERVICIO
// ================================================================

const SERVICE_ICONS: Record<string, React.ElementType> = {
  ortodoncia: Smile,
  "ortopedia-maxilar": Shield,
  "odontologia-general": Stethoscope,
  "odontologia-estetica": Sparkles,
  blanqueamiento: Sun,
  "diseno-sonrisa": Palette,
  "rehabilitacion-oral": HeartPulse,
  periodoncia: Activity,
  profilaxis: Droplets,
};

// ================================================================
// PROPS
// ================================================================

interface ServiceSelectProps {
  selectedService: ServiceCategory | null;
  selectedAppointmentType: AppointmentType | null;
  selectedDate: Date | undefined;
  onSelectService: (service: ServiceCategory) => void;
  onSelectAppointmentType: (type: AppointmentType) => void;
  onSelectDate: (date: Date | undefined) => void;
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export function ServiceSelect({
  selectedService,
  selectedAppointmentType,
  selectedDate,
  onSelectService,
  onSelectAppointmentType,
  onSelectDate,
}: ServiceSelectProps) {
  // Servicios que siempre deben mostrar la selección de tipo de cita
  const alwaysShowAppointmentTypes = [
    "diseno-sonrisa",
    "odontologia-estetica",
    "rehabilitacion-oral",
    "periodoncia",
  ];

  // Auto-seleccionar tipo si el servicio solo tiene uno (excepto los servicios especiales)
  useEffect(() => {
    if (
      selectedService &&
      selectedService.appointmentTypes.length === 1 &&
      !alwaysShowAppointmentTypes.includes(selectedService.id)
    ) {
      onSelectAppointmentType(selectedService.appointmentTypes[0]);
    }
  }, [selectedService, onSelectAppointmentType]);

  const doctor = selectedService
    ? getDoctorForService(selectedService.id)
    : null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* --- Seleccionar servicio --- */}
      <div>
        <h2 className="text-lg font-semibold font-display text-foreground mb-4">
          Selecciona un servicio
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id] || Stethoscope;
            const isSelected = selectedService?.id === service.id;

            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p
                  className={cn(
                    "font-semibold text-sm leading-tight",
                    isSelected ? "text-primary" : "text-card-foreground"
                  )}
                >
                  {service.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Tipo de cita (si el servicio tiene mas de 1 opcion o es un servicio especial) --- */}
      {selectedService &&
        (selectedService.appointmentTypes.length > 1 ||
          alwaysShowAppointmentTypes.includes(selectedService.id)) && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Tipo de cita
          </h2>
          <div className="flex flex-wrap gap-3">
            {selectedService.appointmentTypes.map((type) => {
              const isSelected = selectedAppointmentType?.id === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onSelectAppointmentType(type)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <Clock
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-primary" : "text-card-foreground"
                    )}
                  >
                    {type.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {type.duration === 120
                      ? "2 horas"
                      : type.duration === 90
                      ? "90 Minutos"
                      : type.duration === 60
                      ? "1 hora"
                      : "30 min"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Doctora asignada --- */}
      {selectedService && selectedAppointmentType && doctor && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Atendida por</p>
              <p className="font-semibold text-card-foreground">
                {doctor.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {doctor.specialty}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- Seleccionar fecha --- */}
      {selectedService && selectedAppointmentType && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Selecciona una fecha
          </h2>
          <div className="flex justify-center">
            <div className="bg-card rounded-xl border border-border p-2 shadow-sm">
<Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={onSelectDate}
                        disabled={(date) => isDateDisabledForDoctor(date, doctor?.id)}
                        locale={es}
                        className="pointer-events-auto"
                      />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
