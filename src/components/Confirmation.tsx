import { CheckCircle2, CalendarDays, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Doctor } from "@/lib/types";

interface ConfirmationProps {
  doctor: Doctor;
  date: string;
  time: string;
  patientName: string;
  onNewAppointment: () => void;
}

export function Confirmation({ doctor, date, time, patientName, onNewAppointment }: ConfirmationProps) {
  return (
    <div className="animate-fade-in text-center space-y-6 py-8">
      <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-accent" />
      </div>

      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">¡Cita Agendada!</h2>
        <p className="text-muted-foreground mt-1">Tu cita ha sido registrada exitosamente</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 text-left space-y-4 max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Doctora</p>
            <p className="font-semibold text-card-foreground">{doctor.name}</p>
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
            <p className="text-xs text-muted-foreground">Hora</p>
            <p className="font-semibold text-card-foreground">{time}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Paciente</p>
          <p className="font-semibold text-card-foreground">{patientName}</p>
        </div>
      </div>

      <Button onClick={onNewAppointment} variant="outline" className="mt-4">
        Agendar otra cita
      </Button>
    </div>
  );
}
