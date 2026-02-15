import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { checkActiveAppointment } from "@/lib/api";

interface PatientIdentificationProps {
    onVerified: (cedula: string) => void;
}

export function PatientIdentification({ onVerified }: PatientIdentificationProps) {
    const [cedula, setCedula] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeAppointment, setActiveAppointment] = useState<any | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cedula.trim()) {
            setError("Por favor ingresa tu número de documento");
            return;
        }

        setLoading(true);
        setError(null);
        setActiveAppointment(null);

        try {
            const result = await checkActiveAppointment(cedula);

            if (result.hasActiveAppointment) {
                setActiveAppointment(result.appointment);
            } else {
                onVerified(cedula);
            }
        } catch (err) {
            const isNetworkError =
                err instanceof TypeError && (err.message === "Failed to fetch" || err.message?.includes("fetch"));
            setError(
                isNetworkError
                    ? "No se pudo conectar con el servidor. Asegúrate de que el backend esté en ejecución (puerto 3000)."
                    : err instanceof Error
                        ? err.message
                        : "Error al verificar el documento. Intenta nuevamente."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Bienvenido</h2>
                <p className="text-muted-foreground">
                    Por favor ingresa tu número de documento para continuar.
                </p>
            </div>

            <form onSubmit={handleCheck} className="space-y-4 max-w-sm mx-auto">
                <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula / Documento de Identidad</Label>
                    <Input
                        id="cedula"
                        placeholder="Ej. 1234567890"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {activeAppointment && (
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="h-4 w-4 stroke-yellow-600 dark:stroke-yellow-400" />
                        <AlertTitle className="text-yellow-700 dark:text-yellow-300">
                            Ya tienes una cita activa
                        </AlertTitle>
                        <AlertDescription className="mt-2 text-sm">
                            <p>
                                Encontramos una cita agendada para e l día{" "}
                                <strong>{activeAppointment.fecha}</strong> a las{" "}
                                <strong>{activeAppointment.hora}</strong>.
                            </p>
                            <p className="mt-1">
                                Servicio: {activeAppointment.servicio}
                            </p>
                            <p className="mt-2 text-xs opacity-80">
                                Si necesitas cambiarla o cancelarla, por favor contáctanos.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                {!activeAppointment && (
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            "Continuar"
                        )}
                    </Button>
                )}
            </form>
        </div>
    );
}
