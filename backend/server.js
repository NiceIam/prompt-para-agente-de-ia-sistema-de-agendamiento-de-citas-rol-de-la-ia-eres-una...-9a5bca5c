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
  console.warn('');
}

// Configuracion desde variables de entorno
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Citas';
const CALENDAR_ID = process.env.CALENDAR_ID || 'primary';

/**
 * ESTRUCTURA DEL GOOGLE SHEET:
 * Columna A = ID (cedula / numero de identificacion del paciente)
 * Columna B = Nombre
 * Columna C = Correo
 * Columna D = Telefono
 * Columna E = Fecha (DD/MM/AAAA)
 * Columna F = Hora (HH:MM)
 * Columna G = Estado (Activa | Reagendada | Cancelada | Completada)
 * Columna H = Accion (Agendamiento | Reagendamiento | Cancelacion)
 * Columna I = Doctora (opcional)
 * Columna J = FechaCreacion (ISO timestamp)
 * Columna K = FechaActualizacion (ISO timestamp)
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
      range: `${SHEET_NAME}!A2:K`,
    });

    const rows = response.data.values || [];
    const citas = rows.map((row, index) => ({
      id: (index + 2).toString(),   // Numero de fila en el Sheet (fila 1 = encabezados)
      cedula: row[0] || '',         // Col A: Cedula / numero de identificacion
      nombre: row[1] || '',         // Col B
      correo: row[2] || '',         // Col C
      telefono: row[3] || '',       // Col D
      fecha: row[4] || '',          // Col E
      hora: row[5] || '',           // Col F
      estado: row[6] || 'Activa',   // Col G
      accion: row[7] || 'Agendamiento', // Col H
      doctora: row[8] || '',        // Col I
      createdAt: row[9] || '',      // Col J
      updatedAt: row[10] || '',     // Col K
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
    const { cedula, nombre, correo, telefono, fecha, hora, doctora } = req.body;

    if (!cedula || !nombre || !correo || !telefono || !fecha || !hora) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const now = new Date().toISOString();

    // 1. Escribir en Google Sheets (columnas A-K) — Col A = cedula, Col I = doctora
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:K`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[cedula, nombre, correo, telefono, fecha, hora, 'Activa', 'Agendamiento', doctora || '', now, now]],
      },
    });

    // 2. Crear evento en Google Calendar (si falla, la cita sigue en Sheets)
    let eventId = '';
    try {
      const startDateTime = buildDateTime(fecha, hora);
      const endDateTime = buildDateTime(fecha, hora, 60);

      const event = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: {
          summary: `Cita Odontologica - ${nombre}`,
          description: `Paciente: ${nombre}\nCedula: ${cedula}\nTelefono: ${telefono}\nCorreo: ${correo}`,
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

    console.log(`Cita agendada: ${nombre} - ${fecha} ${hora}`);
    res.json({ success: true, message: 'Cita agendada exitosamente', eventId });
  } catch (error) {
    console.error('Error al agendar cita:', error.message);
    res.status(500).json({ success: false, message: 'Error al agendar la cita: ' + error.message });
  }
});

/**
 * PUT /api/citas/:id
 * Reagendar una cita (actualiza fecha/hora en Sheets)
 * :id = numero de fila en el Sheet
 */
app.put('/api/citas/:id', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.id, 10);
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({ success: false, message: 'Fecha y hora son obligatorias' });
    }

    const now = new Date().toISOString();

    // Leer fila actual para conservar datos del paciente
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:K${rowNumber}`,
    });
    const row = (current.data.values && current.data.values[0]) || [];

    // Actualizar fila completa (A-K)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:K${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          row[0] || '',   // A: ID (conservar)
          row[1] || '',   // B: Nombre (conservar)
          row[2] || '',   // C: Correo (conservar)
          row[3] || '',   // D: Telefono (conservar)
          fecha,          // E: Nueva Fecha
          hora,           // F: Nueva Hora
          'Reagendada',   // G: Estado
          'Reagendamiento', // H: Accion
          row[8] || '',   // I: Doctora (conservar)
          row[9] || '',   // J: FechaCreacion (conservar)
          now,            // K: FechaActualizacion
        ]],
      },
    });

    console.log(`Cita reagendada: fila ${rowNumber} -> ${fecha} ${hora}`);
    res.json({ success: true, message: 'Cita reagendada exitosamente' });
  } catch (error) {
    console.error('Error al reagendar cita:', error.message);
    res.status(500).json({ success: false, message: 'Error al reagendar la cita: ' + error.message });
  }
});

/**
 * DELETE /api/citas/:id
 * Cancelar una cita (NO elimina la fila, solo cambia el estado)
 * :id = numero de fila en el Sheet
 */
app.delete('/api/citas/:id', async (req, res) => {
  try {
    const rowNumber = parseInt(req.params.id, 10);
    const now = new Date().toISOString();

    // Cambiar estado (Col G) y accion (Col H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!G${rowNumber}:H${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['Cancelada', 'Cancelacion']] },
    });

    // Actualizar FechaActualizacion (Col K)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!K${rowNumber}`,
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

/**
 * POST /api/calendar/events
 * Crear evento en Calendar (tambien se crea automaticamente desde POST /api/citas)
 */
app.post('/api/calendar/events', async (req, res) => {
  try {
    const { nombre, correo, telefono, fecha, hora } = req.body;
    const startDateTime = buildDateTime(fecha, hora);
    const endDateTime = buildDateTime(fecha, hora, 60);

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Cita Odontologica - ${nombre}`,
        description: `Paciente: ${nombre}\nTelefono: ${telefono}\nCorreo: ${correo}`,
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

/**
 * PUT /api/calendar/events/:eventId
 * Actualizar evento en Calendar
 */
app.put('/api/calendar/events/:eventId', async (req, res) => {
  try {
    const { nombre, correo, telefono, fecha, hora } = req.body;
    const startDateTime = buildDateTime(fecha, hora);
    const endDateTime = buildDateTime(fecha, hora, 60);

    await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId: req.params.eventId,
      requestBody: {
        summary: `Cita Odontologica (Reagendada) - ${nombre}`,
        description: `Paciente: ${nombre}\nTelefono: ${telefono}\nCorreo: ${correo}\n\nCITA REAGENDADA`,
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

/**
 * DELETE /api/calendar/events/:eventId
 * Eliminar evento del Calendar
 */
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
// HELPERS
// ================================================================

/**
 * Convierte fecha DD/MM/AAAA + hora HH:MM a formato ISO con zona horaria Colombia
 * @param {string} fecha - Formato DD/MM/AAAA
 * @param {string} hora - Formato HH:MM
 * @param {number} minutosExtra - Minutos a sumar (para calcular hora fin)
 * @returns {string} Formato ISO: AAAA-MM-DDTHH:MM:00-05:00
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
