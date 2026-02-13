/**
 * Backend API para sistema de agendamiento de citas
 *
 * Conecta con Google Sheets y Google Calendar usando una Service Account.
 * Cualquier frontend puede llamar a estos endpoints sin necesidad de login del usuario.
 */

require('dotenv').config({ override: true });

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// MIDDLEWARE
// ================================================================
app.use(cors());
app.use(express.json());

// ================================================================
// AUTENTICACION CON SERVICE ACCOUNT
// ================================================================
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
];

let auth = null;
let sheets = null;
let calendar = null;

// Intentar cargar credenciales desde variable de entorno primero
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: SCOPES,
    });
    sheets = google.sheets({ version: 'v4', auth });
    calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Credenciales de Service Account cargadas desde variable de entorno');
  } catch (error) {
    console.error('❌ Error al parsear GOOGLE_CREDENTIALS:', error.message);
  }
}

// Si no hay variable de entorno, intentar cargar desde archivo
if (!auth) {
  const credentialsPath = path.join(__dirname, 'credentials.json');
  if (fs.existsSync(credentialsPath)) {
    auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });
    sheets = google.sheets({ version: 'v4', auth });
    calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Credenciales de Service Account cargadas desde archivo');
  } else {
    console.warn('');
    console.warn('⚠️  CREDENCIALES NO ENCONTRADAS');
    console.warn('   Opciones:');
    console.warn('   1. Agregar variable de entorno GOOGLE_CREDENTIALS con el JSON completo');
    console.warn('   2. Subir archivo credentials.json en la carpeta /app/');
    console.warn('   El servidor arrancará pero las llamadas a Google fallarán.');
    console.warn('');
  }
}

// Configuracion desde variables de entorno
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Citas';
const CALENDAR_ID = process.env.CALENDAR_ID || 'primary';

/**
 * ESTRUCTURA DEL GOOGLE SHEET:
 * Columna A  = ID (cedula / numero de identificacion del paciente)
 * Columna B  = Nombre
 * Columna C  = Correo
 * Columna D  = Telefono
 * Columna E  = Fecha (DD/MM/AAAA)
 * Columna F  = Hora (HH:MM) - hora de inicio
 * Columna G  = Estado (Activa | Reagendada | Cancelada | Completada)
 * Columna H  = Accion (Agendamiento | Reagendamiento | Cancelacion)
 * Columna I  = Servicio (nombre del servicio + tipo de cita)
 * Columna J  = HoraFin (HH:MM) - hora de finalizacion
 * Columna K  = Duracion (minutos: 30 o 60)
 * Columna L  = Doctora
 * Columna M  = FechaCreacion (ISO timestamp)
 * Columna N  = FechaActualizacion (ISO timestamp)
 */

// ================================================================
// MIDDLEWARE DE AUTH
// ================================================================
function requireAuth(req, res, next) {
  if (!sheets || !calendar) {
    return res.status(503).json({
      success: false,
      message: 'Credenciales de Google no configuradas. Agrega credentials.json en backend/',
    });
  }
  next();
}

app.use('/api/citas', requireAuth);
app.use('/api/calendar', requireAuth);

// ================================================================
// HELPERS
// ================================================================

/**
 * Construye una fecha ISO 8601 a partir de fecha DD/MM/AAAA y hora HH:MM
 * con offset de Colombia (-05:00).
 */
function buildDateTime(fecha, hora, minutosExtra = 0) {
  const [dia, mes, anio] = fecha.split('/').map(Number);
  const [h, m] = hora.split(':').map(Number);

  const date = new Date(anio, mes - 1, dia, h, m);
  if (minutosExtra > 0) {
    date.setMinutes(date.getMinutes() + minutosExtra);
  }

  const pad = (n) => n.toString().padStart(2, '0');
  return `${anio}-${pad(mes)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00-05:00`;
}

/**
 * Calcula HoraFin a partir de hora (HH:MM) y duracion (minutos).
 * Ej: calcHoraFin("08:00", 60) -> "09:00"
 */
function calcHoraFin(hora, duracion) {
  const [h, m] = hora.split(':').map(Number);
  const totalMin = h * 60 + m + (parseInt(duracion) || 60);
  const endH = Math.floor(totalMin / 60);
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

// ================================================================
// ENDPOINTS - CITAS (Google Sheets)
// ================================================================

/**
 * GET /api/citas
 * Obtener todas las citas del Google Sheet
 */
app.get('/api/citas', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:N`,
    });

    const rows = response.data.values || [];
    const citas = rows.map((row, index) => ({
      id: (index + 2).toString(),
      cedula: row[0] || '',      // A
      nombre: row[1] || '',      // B
      correo: row[2] || '',      // C
      telefono: row[3] || '',    // D
      fecha: row[4] || '',       // E
      hora: row[5] || '',        // F
      estado: row[6] || 'Activa', // G
      accion: row[7] || 'Agendamiento', // H
      servicio: row[8] || '',    // I
      horaFin: row[9] || '',     // J
      duracion: row[10] || '',   // K
      doctora: row[11] || '',    // L
      createdAt: row[12] || '',  // M
      updatedAt: row[13] || '',  // N
    }));

    res.json({ success: true, data: citas });
  } catch (error) {
    console.error('Error al obtener citas:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener citas: ' + error.message });
  }
});

/**
 * POST /api/citas
 * Agendar nueva cita (escribe en Sheets + crea evento en Calendar)
 */
app.post('/api/citas', async (req, res) => {
  try {
    const { cedula, nombre, correo, telefono, fecha, hora, doctora, servicio, duracion } = req.body;

    if (!cedula || !nombre || !correo || !telefono || !fecha || !hora) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const now = new Date().toISOString();
    const dur = parseInt(duracion) || 60;
    const horaFin = calcHoraFin(hora, dur);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:N`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          cedula,            // A: ID
          nombre,            // B: Nombre
          correo,            // C: Correo
          telefono,          // D: Telefono
          fecha,             // E: Fecha
          hora,              // F: Hora
          'Activa',          // G: Estado
          'Agendamiento',    // H: Accion
          servicio || '',    // I: Servicio
          horaFin,           // J: Hora fin
          dur.toString(),    // K: Duracion
          doctora || '',     // L: Doctora
          now,               // M: FechaCreacion
          now,               // N: FechaActualizacion
        ]],
      },
    });

    let eventId = '';
    try {
      const startDateTime = buildDateTime(fecha, hora);
      const endDateTime = buildDateTime(fecha, hora, dur);

      const event = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: {
          summary: `${servicio || 'Cita Odontologica'} - ${nombre}`,
          description: [
            `Paciente: ${nombre}`,
            `Cedula: ${cedula}`,
            `Telefono: ${telefono}`,
            `Correo: ${correo}`,
            `Servicio: ${servicio || 'No especificado'}`,
            `Doctora: ${doctora || 'No asignada'}`,
            `Duracion: ${dur} minutos`,
          ].join('\n'),
          location: 'Orthodonto - Clinica Odontologica',
          start: { dateTime: startDateTime, timeZone: 'America/Bogota' },
          end: { dateTime: endDateTime, timeZone: 'America/Bogota' },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 1440 },
              { method: 'popup', minutes: 60 },
            ],
          },
        },
      });
      eventId = event.data.id;
    } catch (calErr) {
      console.error('Calendar error (cita SI guardada en Sheets):', calErr.message);
    }

    // ================================================================
    // NOTIFICACION A WEBHOOK (N8N)
    // ================================================================
    try {
      const webhookUrl = 'https://n8n-n8n.dtbfmw.easypanel.host/webhook/c8b807da-3296-402f-b7b2-d8d4546075f6';
      const webhookPayload = {
        cedula,
        nombre,
        correo,
        telefono,
        fecha,
        hora,
        horaFin,
        duracion: dur,
        servicio,
        doctora,
        eventId,
        createdAt: now,
      };

      // No esperamos a que termine para no bloquear la respuesta al cliente,
      // pero si queremos asegurar que se envie, podemos usar await. 
      // Dado el requisito "envies un json", asumire que es mejor esperar para confirmar o al menos disparar.
      // Usaremos fetch (nativo en Node 18+)
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })
        .then(response => {
          if (response.ok) {
            console.log('✅ Webhook enviado exitosamente');
          } else {
            console.error(`❌ Error al enviar webhook: ${response.status} ${response.statusText}`);
          }
        })
        .catch(err => console.error('❌ Error de red al enviar webhook:', err.message));

    } catch (webhookErr) {
      console.error('❌ Error inesperado en webhook:', webhookErr.message);
    }

    console.log(`Cita agendada: ${nombre} - ${servicio || 'Sin servicio'} - ${fecha} ${hora}-${horaFin} (${dur}min)`);
    res.json({ success: true, message: 'Cita agendada exitosamente', eventId });
  } catch (error) {
    console.error('Error al agendar cita:', error.message);
    res.status(500).json({ success: false, message: 'Error al agendar la cita: ' + error.message });
  }
});

/**
 * PUT /api/citas/:id
 * Reagendar una cita (actualiza fecha/hora en Sheets, recalcula HoraFin)
 */
app.put('/api/citas/:id', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.id, 10);
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({ success: false, message: 'Fecha y hora son obligatorias' });
    }

    const now = new Date().toISOString();

    // Leer la fila actual completa (A:N)
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:N${rowNumber}`,
    });
    const row = (current.data.values && current.data.values[0]) || [];

    // Preservar la duracion original (col K, index 10); si no existe, asumir 60 min
    const originalDuracion = parseInt(row[10]) || 60;
    const newHoraFin = calcHoraFin(hora, originalDuracion);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:N${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          row[0] || '',   // A: cedula (se preserva)
          row[1] || '',   // B: nombre (se preserva)
          row[2] || '',   // C: correo (se preserva)
          row[3] || '',   // D: telefono (se preserva)
          fecha,          // E: nueva fecha
          hora,           // F: nueva hora
          'Reagendada',   // G: estado
          'Reagendamiento', // H: accion
          row[8] || '',   // I: servicio (se preserva)
          newHoraFin,     // J: hora fin (recalculada)
          row[10] || originalDuracion.toString(), // K: duracion (se preserva)
          row[11] || '',  // L: doctora (se preserva)
          row[12] || '',  // M: fechaCreacion (se preserva)
          now,            // N: fechaActualizacion
        ]],
      },
    });

    console.log(`Cita reagendada: fila ${rowNumber} -> ${fecha} ${hora}-${newHoraFin} (${originalDuracion}min)`);
    res.json({ success: true, message: 'Cita reagendada exitosamente' });
  } catch (error) {
    console.error('Error al reagendar cita:', error.message);
    res.status(500).json({ success: false, message: 'Error al reagendar la cita: ' + error.message });
  }
});

/**
 * DELETE /api/citas/:id
 * Cancelar una cita (NO elimina la fila, solo cambia el estado)
 */
app.delete('/api/citas/:id', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.id, 10);
    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!G${rowNumber}:H${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['Cancelada', 'Cancelacion']] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!N${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[now]] },
    });

    console.log(`Cita cancelada: fila ${rowNumber}`);
    res.json({ success: true, message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar cita:', error.message);
    res.status(500).json({ success: false, message: 'Error al cancelar la cita: ' + error.message });
  }
});

// ================================================================
// ENDPOINTS - CALENDAR (independientes)
// ================================================================

app.post('/api/calendar/events', async (req, res) => {
  try {
    const { nombre, correo, telefono, fecha, hora, duracion, servicio } = req.body;
    const dur = parseInt(duracion) || 60;
    const startDateTime = buildDateTime(fecha, hora);
    const endDateTime = buildDateTime(fecha, hora, dur);

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `${servicio || 'Cita Odontologica'} - ${nombre}`,
        description: `Paciente: ${nombre}\nTelefono: ${telefono}\nCorreo: ${correo}\nServicio: ${servicio || 'No especificado'}\nDuracion: ${dur} minutos`,
        location: 'Orthodonto - Clinica Odontologica',
        start: { dateTime: startDateTime, timeZone: 'America/Bogota' },
        end: { dateTime: endDateTime, timeZone: 'America/Bogota' },
      },
    });
    res.json({ success: true, eventId: event.data.id });
  } catch (error) {
    console.error('Error al crear evento:', error.message);
    res.status(500).json({ success: false, message: 'Error al crear evento: ' + error.message });
  }
});

app.put('/api/calendar/events/:eventId', async (req, res) => {
  try {
    const { nombre, correo, telefono, fecha, hora, duracion, servicio } = req.body;
    const dur = parseInt(duracion) || 60;
    const startDateTime = buildDateTime(fecha, hora);
    const endDateTime = buildDateTime(fecha, hora, dur);

    await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId: req.params.eventId,
      requestBody: {
        summary: `${servicio || 'Cita Odontologica'} (Reagendada) - ${nombre}`,
        description: `Paciente: ${nombre}\nTelefono: ${telefono}\nCorreo: ${correo}\nServicio: ${servicio || 'No especificado'}\nDuracion: ${dur} minutos\n\nCITA REAGENDADA`,
        start: { dateTime: startDateTime, timeZone: 'America/Bogota' },
        end: { dateTime: endDateTime, timeZone: 'America/Bogota' },
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar evento:', error.message);
    res.status(500).json({ success: false, message: 'Error al actualizar evento' });
  }
});

app.delete('/api/calendar/events/:eventId', async (req, res) => {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: req.params.eventId,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar evento:', error.message);
    res.status(500).json({ success: false, message: 'Error al eliminar evento' });
  }
});

// ================================================================
// HEALTH CHECK
// ================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Orthodonto API funcionando',
    google: sheets ? 'conectado' : 'sin credenciales',
    spreadsheetId: SPREADSHEET_ID ? 'configurado' : 'falta',
  });
});

// ================================================================
// INICIAR SERVIDOR
// ================================================================

app.listen(PORT, () => {
  console.log('');
  console.log(`Orthodonto API corriendo en http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Sheet: ${SPREADSHEET_ID}`);
  console.log(`   Hoja: ${SHEET_NAME}`);
  console.log(`   Calendar: ${CALENDAR_ID}`);
  console.log('');
});
