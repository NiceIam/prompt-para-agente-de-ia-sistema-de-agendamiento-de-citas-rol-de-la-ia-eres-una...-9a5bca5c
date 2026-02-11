import { Clock, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSlot } from "@/lib/types";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (hour: string) => void;
  loading: boolean;
  duration: number; // duracion de la cita en minutos (30 o 60)
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  duration,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-muted-foreground text-sm">Consultando disponibilidad...</p>
      </div>
    );
  }

  const morningSlots = slots.filter((s) => s.period === "morning");
  const afternoonSlots = slots.filter((s) => s.period === "afternoon");

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-lg font-semibold font-display text-foreground">
        Selecciona un horario
      </h2>

      {/* Banner informativo de duracion */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300">
        <Info className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm">
          {duration === 60
            ? "Tu cita dura 1 hora. Se reservarán 2 bloques consecutivos de 30 minutos."
            : "Tu cita dura 30 minutos."}
        </p>
      </div>

      <SlotGroup title="Mañana" icon="🌅" slots={morningSlots} selectedSlot={selectedSlot} onSelect={onSelectSlot} />
      <SlotGroup title="Tarde" icon="☀️" slots={afternoonSlots} selectedSlot={selectedSlot} onSelect={onSelectSlot} />
    </div>
  );
}

function SlotGroup({
  title,
  icon,
  slots,
  selectedSlot,
  onSelect,
}: {
  title: string;
  icon: string;
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (hour: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-3">
        {icon} {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.hour}
            onClick={() => slot.available && onSelect(slot.hour)}
            disabled={!slot.available}
            className={cn(
              "flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all duration-200",
              slot.available && selectedSlot !== slot.hour &&
                "border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer",
              selectedSlot === slot.hour &&
                "border-primary bg-primary/5 shadow-md shadow-primary/10",
              !slot.available &&
                "border-border bg-muted/50 cursor-not-allowed opacity-60"
            )}
          >
            <Clock className={cn("w-4 h-4", slot.available ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("font-semibold text-sm", slot.available ? "text-card-foreground" : "text-muted-foreground")}>
              {slot.label}
            </span>
            <span className={cn("text-xs", slot.available ? "text-accent" : "text-muted-foreground")}>
              {slot.available ? "Disponible" : "No disponible"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
