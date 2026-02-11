import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Doctor, DOCTORS } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

interface DoctorSelectProps {
  selectedDoctor: Doctor | null;
  selectedDate: Date | undefined;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectDate: (date: Date | undefined) => void;
}

export function DoctorSelect({
  selectedDoctor,
  selectedDate,
  onSelectDoctor,
  onSelectDate,
}: DoctorSelectProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-lg font-semibold font-display text-foreground mb-4">
          Selecciona una doctora
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DOCTORS.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => onSelectDoctor(doctor)}
              className={cn(
                "relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left",
                selectedDoctor?.id === doctor.id
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedDoctor?.id === doctor.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold font-display text-card-foreground">{doctor.name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
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
                disabled={(date) => date < today || !isWeekday(date)}
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
