// test-timezone.js
// Prueba local de la lógica de zonas horarias para update-expired

// --- 1. LÓGICA DE server.js (CORREGIDA) ---
function parseAppointmentDateTime(fecha, hora) {
    try {
        const [dia, mes, anio] = fecha.split('/').map(Number);
        const [h, m] = hora.split(':').map(Number);

        // Forzamos el string ISO con zona horaria de Colombia UTC-5
        const pad = (n) => n.toString().padStart(2, '0');
        const isoString = `${anio}-${pad(mes)}-${pad(dia)}T${pad(h)}:${pad(m)}:00-05:00`;
        return new Date(isoString);
    } catch (error) {
        console.error('Error al parsear fecha/hora:', error);
        return null;
    }
}

function evaluateExpiration(fechaCitaDDMMYYYY, horaFinHHMM) {
    const appointmentEndTime = parseAppointmentDateTime(fechaCitaDDMMYYYY, horaFinHHMM);

    const now = new Date();

    // Script para simular lo que pasaba ANTES (con new Date() directo si el server estuviese en UTC):
    // (Nota: si corremos esto en tu PC local en Colombia, 'now' ya es Colombia. Pero simularemos que el server es UTC)
    // Como estamos probando la logica CORREGIDA, simulamos la hora actual de Colombia:
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

    console.log(`\n--- EVALUACIÓN DE CITA ---`);
    console.log(`Cita configurada para terminar el: ${fechaCitaDDMMYYYY} a las ${horaFinHHMM}`);
    console.log(`1. Hora Fin interpretada (Date Obj): ${appointmentEndTime.toISOString()}`);
    console.log(`2. Hora actual Colombia (ISO):       ${nowColombiaIso}`);
    console.log(`3. Hora actual Colombia (Date Obj):  ${nowColombia.toISOString()}`);

    if (isExpired) {
        console.log(`=> 🔴 RESULTADO: La cita YA PASÓ. Se marcará como 'Atendida'.`);
    } else {
        console.log(`=> 🟢 RESULTADO: La cita es FUTURA o AÚN NO TERMINA. No se modificará.`);
    }
}

// --- 2. CASOS DE PRUEBA ---
console.log("Iniciando pruebas de validación de Zonas Horarias (Simulando hora actual):");

// Cita que ya pasó hace dos horas
// Obtenemos una fecha y hora de hace 2 horas para simular
let now = new Date();
now.setHours(now.getHours() - 2);
let pad = (n) => n.toString().padStart(2, '0');
let fechaPasada = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
let horaPasada = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
evaluateExpiration(fechaPasada, horaPasada);

// Cita de MAÑANA (Futura)
let manana = new Date();
manana.setDate(manana.getDate() + 1);
let fechaFutura = `${pad(manana.getDate())}/${pad(manana.getMonth() + 1)}/${manana.getFullYear()}`;
let horaFutura = `15:00`;
evaluateExpiration(fechaFutura, horaFutura);

// Cita dentro de 3 horas (Futura hoy)
let hoyFutura = new Date();
hoyFutura.setHours(hoyFutura.getHours() + 3);
let fechaFuturaHoy = `${pad(hoyFutura.getDate())}/${pad(hoyFutura.getMonth() + 1)}/${hoyFutura.getFullYear()}`;
let horaFuturaHoy = `${pad(hoyFutura.getHours())}:${pad(hoyFutura.getMinutes())}`;
evaluateExpiration(fechaFuturaHoy, horaFuturaHoy);
