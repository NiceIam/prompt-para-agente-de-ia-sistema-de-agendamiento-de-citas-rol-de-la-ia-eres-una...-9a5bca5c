# Guía de Despliegue - Orthodonto

## Arquitectura
Este proyecto tiene dos componentes separados:
- **Frontend**: React + Vite (raíz del proyecto)
- **Backend**: Express + Node.js (carpeta `/backend`)

## Paso 1: Desplegar el Backend

### En Hostinger/Easypanel:

1. Crea un nuevo servicio llamado "orthodonto-backend"
2. Conecta el mismo repositorio de GitHub
3. En la configuración del servicio:
   - **Root Directory**: `backend`
   - **Build Command**: (automático con Nixpacks)
   - **Start Command**: `node server.js`
   - **Puerto**: 3000

4. Configura las siguientes **Variables de Entorno**:
   ```
   PORT=3000
   SPREADSHEET_ID=tu_spreadsheet_id_aqui
   SHEET_NAME=Citas
   CALENDAR_ID=primary
   ```

5. **IMPORTANTE**: Sube el archivo `credentials.json` de Google Service Account:
   - Ve a la sección de archivos del servicio backend
   - Sube `credentials.json` en la carpeta `/backend/`
   - Este archivo contiene las credenciales de la Service Account de Google

6. Despliega el servicio y anota la URL del backend (ej: `https://orthodonto-backend.tu-dominio.com`)

## Paso 2: Configurar el Frontend

1. En tu repositorio local, edita el archivo `.env.production`:
   ```
   VITE_API_URL=https://orthodonto-backend.tu-dominio.com
   ```

2. Haz commit y push:
   ```bash
   git add .env.production
   git commit -m "config: actualizar URL del backend en producción"
   git push
   ```

## Paso 3: Desplegar el Frontend

1. En Hostinger/Easypanel, el servicio "orthodonto" (frontend) ya debe estar creado
2. Configuración del servicio:
   - **Root Directory**: (raíz, dejar vacío)
   - **Build Command**: `bun run build`
   - **Puerto**: 8080

3. El frontend se reconstruirá automáticamente con la nueva URL del backend

## Verificación

### Backend:
Visita: `https://tu-backend-url.com/api/health`

Deberías ver:
```json
{
  "status": "ok",
  "message": "Orthodonto API funcionando",
  "google": "conectado",
  "spreadsheetId": "configurado"
}
```

### Frontend:
Visita: `https://tu-frontend-url.com`

Deberías ver la página de inicio de la clínica.

## Solución de Problemas

### Frontend en blanco:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica que el build se completó correctamente en los logs de Hostinger
3. Asegúrate de que el archivo `Caddyfile` esté en la raíz del proyecto

### Backend no conecta con Google:
1. Verifica que `credentials.json` esté en `/backend/`
2. Revisa las variables de entorno (SPREADSHEET_ID, etc.)
3. Verifica los logs del backend para ver errores específicos

### CORS errors:
El backend ya tiene CORS habilitado. Si hay problemas:
1. Verifica que la URL del backend en `.env.production` sea correcta
2. Asegúrate de que no haya espacios o caracteres extra en la URL
