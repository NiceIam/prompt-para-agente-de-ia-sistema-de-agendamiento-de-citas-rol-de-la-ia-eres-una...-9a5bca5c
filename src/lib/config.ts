/**
 * Configuración de la aplicación
 */

// URL base de la API
// En desarrollo usa el proxy de Vite (/api -> http://localhost:3000)
// En producción usa la variable de entorno VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Otras configuraciones pueden ir aquí
export const APP_NAME = 'Clínica Orthodonto';
export const APP_VERSION = '1.0.0';
