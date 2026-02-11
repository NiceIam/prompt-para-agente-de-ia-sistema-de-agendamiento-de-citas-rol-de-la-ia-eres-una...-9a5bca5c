# Pasos para Conectar Frontend y Backend en Hostinger

## 🔴 PASO 1: Desplegar el Backend

1. En Hostinger/Easypanel, crea un NUEVO servicio:
   - Nombre: `orthodonto-backend`
   - Repositorio: El mismo de GitHub
   - **Root Directory**: `backend` ⚠️ MUY IMPORTANTE

2. Configuración del servicio backend:
   - Puerto: `3000`
   - El build se hace automático con Nixpacks

3. Variables de Entorno del Backend (agregar en Hostinger):
   ```
   PORT=3000
   SPREADSHEET_ID=tu_id_de_google_sheet_aqui
   SHEET_NAME=Citas
   CALENDAR_ID=primary
   ```

4. **IMPORTANTE - Archivo credentials.json**:
   - Necesitas subir el archivo `credentials.json` de Google Service Account
   - Este archivo lo obtienes de Google Cloud Console
   - Súbelo en la carpeta `/backend/` del servicio

5. Despliega y espera a que termine
6. **COPIA LA URL** del backend (ejemplo: `https://orthodonto-backend-abc123.easypanel.host`)

## 🟢 PASO 2: Conectar el Frontend con el Backend

1. En tu computadora, edita el archivo `.env.production`:
   ```
   VITE_API_URL=https://orthodonto-backend-abc123.easypanel.host/api
   ```
   ⚠️ Reemplaza con la URL REAL de tu backend + `/api` al final

2. Guarda y haz commit:
   ```bash
   git add .env.production src/lib/config.ts src/lib/api.ts
   git commit -m "config: conectar frontend con backend en producción"
   git push
   ```

3. El frontend se redesplegar automáticamente en Hostinger

## ✅ PASO 3: Verificar que Todo Funciona

### Verificar Backend:
Abre en tu navegador: `https://tu-backend-url.com/api/health`

Deberías ver algo como:
```json
{
  "status": "ok",
  "message": "Orthodonto API funcionando",
  "google": "conectado",
  "spreadsheetId": "configurado"
}
```

### Verificar Frontend:
1. Abre tu sitio web: `https://tu-frontend-url.com`
2. Deberías ver la página de inicio de la clínica
3. Haz clic en "Agendar Cita"
4. Intenta agendar una cita de prueba

## 🔧 Solución de Problemas

### El frontend sigue en blanco:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console" y busca errores
3. Si ves errores de CORS o de red, verifica la URL del backend en `.env.production`

### El backend no responde:
1. Ve a los logs del servicio backend en Hostinger
2. Busca errores relacionados con `credentials.json` o variables de entorno
3. Asegúrate de que el archivo `credentials.json` esté en la carpeta correcta

### Error "google: sin credenciales":
1. El archivo `credentials.json` no está en el lugar correcto
2. Súbelo manualmente en Hostinger en la carpeta `/backend/`

### CORS errors:
El backend ya tiene CORS habilitado para todos los orígenes. Si hay problemas:
1. Verifica que la URL en `.env.production` termine en `/api`
2. Asegúrate de que no haya espacios en la URL
3. Verifica que el backend esté corriendo (prueba el endpoint `/api/health`)

## 📝 Notas Importantes

- El frontend usa `/api` como proxy en desarrollo (localhost)
- En producción usa la URL completa del backend desde `.env.production`
- Cada vez que cambies `.env.production`, debes hacer commit y push
- El backend necesita `credentials.json` para conectarse a Google Sheets/Calendar
