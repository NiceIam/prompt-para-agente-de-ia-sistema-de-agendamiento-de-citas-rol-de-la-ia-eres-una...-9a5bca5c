# Sistema de Actualización Automática de Citas

## Cómo Funciona

El sistema ahora actualiza automáticamente el estado de las citas de **"Activa"** a **"Atendida"** cuando ya pasó la hora de finalización.

### Características Principales

1. **Actualización en Tiempo Real**
   - Cada vez que un paciente intenta agendar una cita, el sistema verifica si tiene citas activas
   - Si encuentra una cita "Activa" pero ya pasó la hora de finalización, la actualiza automáticamente a "Atendida"
   - El paciente puede agendar inmediatamente después

2. **Respeta Cambios Manuales**
   - Si la doctora cambia el estado manualmente en Google Sheets (por ejemplo, marca como "Atendida" antes de tiempo), el sistema respeta ese cambio
   - El sistema solo actualiza citas que estén en estado "Activa"

3. **Endpoint Manual de Actualización**
   - `POST /api/citas/update-expired` - Actualiza todas las citas vencidas de una vez
   - Útil para ejecutar manualmente o configurar con un cron job

## Flujo de Trabajo

### Escenario 1: Cita termina a tiempo
1. Paciente tiene cita el 02/03/2026 a las 8:30 (duración 60 min, termina a las 9:30)
2. A las 9:47 el paciente intenta agendar otra cita
3. El sistema detecta que la cita ya terminó (9:47 > 9:30)
4. Actualiza automáticamente el estado a "Atendida"
5. Permite al paciente agendar una nueva cita

### Escenario 2: Doctora termina la cita antes
1. Paciente tiene cita el 02/03/2026 a las 8:30 (termina a las 9:30)
2. A las 9:15 la doctora termina la consulta
3. La doctora cambia manualmente el estado en Google Sheets a "Atendida"
4. El paciente puede agendar inmediatamente sin esperar a las 9:30

### Escenario 3: Cita aún no termina
1. Paciente tiene cita el 02/03/2026 a las 8:30 (termina a las 9:30)
2. A las 9:00 el paciente intenta agendar otra cita
3. El sistema detecta que la cita aún está en curso (9:00 < 9:30)
4. Bloquea el agendamiento y muestra mensaje de cita activa

## Mantenimiento

### Actualización Manual de Todas las Citas Vencidas

Puedes ejecutar este comando para actualizar todas las citas vencidas:

```bash
curl -X POST http://localhost:3000/api/citas/update-expired
```

### Configurar Cron Job (Opcional)

Si quieres ejecutar la actualización automáticamente cada hora:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ejecuta cada hora)
0 * * * * curl -X POST http://localhost:3000/api/citas/update-expired
```

## Columnas de Google Sheets

El sistema utiliza estas columnas:
- **Columna E**: Fecha (DD/MM/AAAA)
- **Columna F**: Hora inicio (HH:MM)
- **Columna G**: Estado (Activa | Cancelada | Atendida)
- **Columna H**: Acción (Agendamiento | Reagendamiento | Cancelacion | Atendida)
- **Columna J**: Hora fin (HH:MM)
- **Columna N**: Fecha de actualización (ISO timestamp)

## Logs

El sistema registra en consola cuando actualiza una cita:
```
✅ Cita auto-actualizada a "Atendida": fila 5 (02/03/2026 09:30)
```
