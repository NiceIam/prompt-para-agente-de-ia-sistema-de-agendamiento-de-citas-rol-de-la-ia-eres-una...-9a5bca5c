
# Sistema de Agendamiento de Citas Médicas

## Resumen
Aplicación web de agendamiento de citas para 2 doctoras, con integración a Google Sheets como base de datos. Interfaz pública simple donde los pacientes agendan en 3 pasos.

---

## Pantalla Principal – Flujo de 3 Pasos

### Paso 1: Seleccionar Doctora y Fecha
- Selector visual para elegir entre las 2 doctoras (tarjetas con nombre y foto/ícono)
- Calendario interactivo para seleccionar la fecha (solo días hábiles, sin fechas pasadas)
- Diseño limpio con la doctora seleccionada resaltada

### Paso 2: Seleccionar Hora
- Grilla de bloques horarios disponibles:
  - **Mañana:** 8:00, 9:00, 10:00, 11:00
  - **Tarde:** 2:00, 3:00, 4:00, 5:00
  - (La jornada termina a las 6pm, último bloque es 5:00-6:00)
- Cada bloque muestra estado visual: disponible (verde) o lleno (gris/deshabilitado)
- Máximo 2 citas por bloque de hora por doctora
- La disponibilidad se consulta en tiempo real desde Google Sheets

### Paso 3: Formulario de Datos del Paciente
- Campos con validación en tiempo real:
  - **Cédula** (obligatorio, solo números)
  - **Nombre completo** (obligatorio)
  - **Correo electrónico** (obligatorio, formato válido)
  - **Número telefónico** (obligatorio, formato válido)
- Al confirmar: se envía toda la información a Google Sheets
- Datos enviados: ID, nombre, correo, teléfono, fecha, hora, estado ("Agendada"), nombre de la doctora, fecha de creación (timestamp)

### Confirmación
- Pantalla de confirmación con resumen de la cita (doctora, fecha, hora)
- Opción para agendar otra cita

---

## Integración con Google Sheets (Backend)

- **Edge Function en Lovable Cloud** que se conecta a Google Sheets API
- Funciones:
  - **Leer disponibilidad:** Consulta las citas existentes para una doctora y fecha, cuenta cuántas hay por hora, y retorna los bloques disponibles
  - **Crear cita:** Agrega una nueva fila con todos los campos del formulario
  - **Validación doble:** Antes de crear, re-verifica que el bloque no esté lleno (previene condiciones de carrera)
- Manejo de errores con mensajes claros al usuario si falla la conexión

---

## Diseño Visual
- Estilo moderno y profesional con colores suaves (tonos azules/médicos)
- Totalmente responsive (móvil y escritorio)
- Indicadores de progreso (pasos 1-2-3)
- Feedback visual claro: loading states, confirmaciones, errores
