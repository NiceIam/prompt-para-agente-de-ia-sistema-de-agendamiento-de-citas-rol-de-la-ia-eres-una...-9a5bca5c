import { useNavigate } from "react-router-dom";
import { CheckCircle2, CalendarDays, Clock, User, Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationProps {
  serviceName: string;
  doctorName: string;
  date: string;
  time: string; // rango "8:00 AM - 9:00 AM"
  duration: number;
  patientName: string;
  onNewAppointment: () => void;
}

export function Confirmation({
  serviceName,
  doctorName,
  date,
  time,
  duration,
  patientName,
  onNewAppointment,
}: ConfirmationProps) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in text-center space-y-6 py-8">
      {/* ... existing structure ... */}
      <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-accent" />
      </div>

      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">¡Cita Agendada!</h2>
        <p className="text-muted-foreground mt-1">Tu cita ha sido registrada exitosamente</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 text-left space-y-4 max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Servicio</p>
            <p className="font-semibold text-card-foreground">{serviceName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Doctora</p>
            <p className="font-semibold text-card-foreground">{doctorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Fecha</p>
            <p className="font-semibold text-card-foreground">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">
              Horario ({duration === 120
                ? "2 horas"
                : duration === 90
                ? "1.5 horas"
                : duration === 60
                ? "1 hora"
                : "30 min"})
            </p>
            <p className="font-semibold text-card-foreground">{time}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Paciente</p>
          <p className="font-semibold text-card-foreground">{patientName}</p>
        </div>
      </div>

      {/* Mensaje importante sobre radiografía */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
              Requisito importante
            </p>
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Para su cita, es necesario que traiga una <strong>radiografía panorámica reciente</strong>.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
        Volver al inicio
      </Button>
    </div>
  );
}
