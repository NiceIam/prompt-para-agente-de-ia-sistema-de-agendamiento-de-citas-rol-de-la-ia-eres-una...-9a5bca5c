// JSON output test script
const fs = require('fs');

function parseAppointmentDateTime(fecha, hora) {
    try {
        const [dia, mes, anio] = fecha.split('/').map(Number);
        const [h, m] = hora.split(':').map(Number);
        const pad = (n) => n.toString().padStart(2, '0');
        const isoString = `${anio}-${pad(mes)}-${pad(dia)}T${pad(h)}:${pad(m)}:00-05:00`;
        return new Date(isoString);
    } catch (error) {
        return null;
    }
}

const results = [];

function evaluateExpiration(fechaCitaDDMMYYYY, horaFinHHMM, descripcion) {
    const appointmentEndTime = parseAppointmentDateTime(fechaCitaDDMMYYYY, horaFinHHMM);
    const now = new Date();

    const nowParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(now);

    const parts = {};
    nowParts.forEach(({ type, value }) => parts[type] = value);
    let h = parts.hour;
    if (h === '24') h = '00';

    const nowColombiaIso = `${parts.year}-${parts.month}-${parts.day}T${h}:${parts.minute}:${parts.second}-05:00`;
    const nowColombia = new Date(nowColombiaIso);

    const isExpired = nowColombia > appointmentEndTime;

    results.push({
        escenario: descripcion,
        fechaCita: `${fechaCitaDDMMYYYY} ${horaFinHHMM}`,
        horaCita_ISO: appointmentEndTime.toISOString(),
        horaActual_Colombia_ISO: nowColombia.toISOString(),
        yaTerminada: isExpired
    });
}

// 1. Cita pasada
let past = new Date(); past.setHours(past.getHours() - 2);
let pad = (n) => n.toString().padStart(2, '0');
evaluateExpiration(`${pad(past.getDate())}/${pad(past.getMonth() + 1)}/${past.getFullYear()}`, `${pad(past.getHours())}:00`, 'Cita pasada (hace 2 horas)');

// 2. Cita futura
let future = new Date(); future.setHours(future.getHours() + 3);
evaluateExpiration(`${pad(future.getDate())}/${pad(future.getMonth() + 1)}/${future.getFullYear()}`, `${pad(future.getHours())}:00`, 'Cita futura (en 3 horas)');

fs.writeFileSync('test-timezone-output.json', JSON.stringify(results, null, 2));
