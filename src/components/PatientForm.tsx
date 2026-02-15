import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PatientData } from "@/lib/types";

const schema = z.object({
  cedula: z
    .string()
    .min(1, "La cédula es obligatoria")
    .transform((val) => val.replace(/\s|[.-]/g, ""))
    .refine((val) => /^\d+$/.test(val), "Solo se permiten números (sin espacios, puntos ni guiones)")
    .refine((val) => val.length >= 5 && val.length <= 12, "La cédula debe tener entre 5 y 12 dígitos"),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras y espacios"),
  correo: z
    .string()
    .min(1, "El correo es obligatorio")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Formato de correo no válido (ejemplo: usuario@dominio.com)"
    ),
  telefono: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos"),
});

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  loading: boolean;
  initialCedula?: string;
}

export function PatientForm({ onSubmit, loading, initialCedula }: PatientFormProps) {
  const form = useForm<PatientData>({
    resolver: zodResolver(schema),
    defaultValues: { cedula: initialCedula || "", nombre: "", correo: "", telefono: "" },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-semibold font-display text-foreground mb-6">
        Datos del paciente
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="cedula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula / Número de identificación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre y apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número telefónico</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 3001234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Agendando...
              </>
            ) : (
              "Confirmar Cita"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
