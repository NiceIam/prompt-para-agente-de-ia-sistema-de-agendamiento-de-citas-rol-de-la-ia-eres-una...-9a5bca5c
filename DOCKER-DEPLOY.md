# Despliegue con Docker en Hostinger

## 📦 Estructura de Dockerfiles

- **Frontend**: `Dockerfile` (raíz del proyecto)
- **Backend**: `backend/Dockerfile`

## 🚀 PASO 1: Desplegar el Backend

### En Hostinger/Easypanel:

1. **Crear nuevo servicio**:
   - Nombre: `orthodonto-backend`
   - Tipo: Docker
   - Repositorio: Tu repo de GitHub

2. **Configuración del servicio**:
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context Path**: `backend`
   - **Puerto**: `3000`

3. **Variables de Entorno** (agregar en Hostinger):
   ```
   PORT=3000
   NODE_ENV=production
   SPREADSHEET_ID=1F8MG-UU0af0aEj87TcUpPmP4kcp3-GTddKOSJd2pIKw
   SHEET_NAME=Citas
   CALENDAR_ID=primary
   ```

4. **Subir credentials.json**:
   - Opción A: Subir el archivo manualmente a `/app/credentials.json`
   - Opción B: Usar variable de entorno `GOOGLE_CREDENTIALS` (más seguro)

5. **Desplegar** y copiar la URL del backend
   - Ejemplo: `https://orthodonto-backend.tu-dominio.com`

## 🎨 PASO 2: Desplegar el Frontend

### Antes de desplegar:

1. **Actualizar `.env.production`** en tu repo local:
   ```
   VITE_API_URL=https://orthodonto-backend.tu-dominio.com/api
   ```
   ⚠️ Reemplaza con la URL REAL de tu backend + `/api`

2. **Hacer commit y push**:
   ```bash
   git add .env.production
   git commit -m "config: actualizar URL del backend"
   git push
   ```

### En Hostinger/Easypanel:

1. **Crear nuevo servicio**:
   - Nombre: `orthodonto-frontend`
   - Tipo: Docker
   - Repositorio: Tu repo de GitHub

2. **Configuración del servicio**:
   - **Dockerfile Path**: `Dockerfile`
   - **Context Path**: `.` (raíz)
   - **Puerto**: `8080`

3. **Build Arguments** (si es necesario):
   ```
   VITE_API_URL=https://orthodonto-backend.tu-dominio.com/api
   ```

4. **Desplegar**

## ✅ Verificación

### Backend:
```bash
curl https://tu-backend-url.com/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "Orthodonto API funcionando",
  "google": "conectado",
  "spreadsheetId": "configurado"
}
```

### Frontend:
Abre en el navegador: `https://tu-frontend-url.com`

Deberías ver la página de inicio de la clínica.

## 🔧 Comandos útiles para desarrollo local

### Backend:
```bash
cd backend
docker build -t orthodonto-backend .
docker run -p 3000:3000 \
  -e SPREADSHEET_ID=tu_id \
  -e SHEET_NAME=Citas \
  -e CALENDAR_ID=primary \
  -v $(pwd)/credentials.json:/app/credentials.json \
  orthodonto-backend
```

### Frontend:
```bash
docker build -t orthodonto-frontend .
docker run -p 8080:8080 orthodonto-frontend
```

## 🐛 Solución de Problemas

### Frontend en blanco:
1. Verifica que el build se completó: revisa los logs de Docker
2. Verifica que `dist/index.html` existe en la imagen
3. Abre la consola del navegador (F12) para ver errores

### Backend no conecta:
1. Verifica que `credentials.json` esté en `/app/`
2. Revisa las variables de entorno
3. Verifica los logs del contenedor

### CORS errors:
1. Verifica que la URL en `.env.production` sea correcta
2. Asegúrate de que termine en `/api`
3. No debe haber espacios ni caracteres extra

## 📝 Notas

- Los Dockerfiles usan multi-stage builds para optimizar el tamaño
- El frontend usa Caddy como servidor web (ligero y eficiente)
- El backend usa Node.js 20 Alpine (imagen pequeña)
- Las credenciales de Google NO se incluyen en la imagen por seguridad
