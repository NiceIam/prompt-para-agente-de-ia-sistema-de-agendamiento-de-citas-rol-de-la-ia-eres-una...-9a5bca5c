# Solución de Problemas - "Not Found"

## 🔴 Problema: Página muestra "Not Found" o "Service is not reachable"

Esto significa que Caddy está corriendo pero no encuentra los archivos del build.

## ✅ Solución Paso a Paso

### 1. Verificar los logs del build en Hostinger

Busca en los logs de construcción:
- ¿Se ejecutó `npm run build`?
- ¿Hay errores durante el build?
- ¿Se creó la carpeta `dist`?

### 2. Verificar que el Dockerfile se está usando

En la configuración del servicio en Hostinger:
- **Dockerfile Path**: debe ser `Dockerfile` (no `Dockerfile.simple`)
- **Context Path**: debe ser `.` (punto, significa raíz)
- **Build Context**: debe apuntar a la raíz del repositorio

### 3. Verificar variables de entorno

El build de Vite necesita la variable `VITE_API_URL`. En Hostinger:

**Opción A: Build Arguments**
```
VITE_API_URL=https://tu-backend-url.com/api
```

**Opción B: Actualizar .env.production antes de hacer push**
```bash
# En tu computadora
echo "VITE_API_URL=https://tu-backend-url.com/api" > .env.production
git add .env.production
git commit -m "config: actualizar URL del backend"
git push
```

### 4. Forzar rebuild completo

En Hostinger:
1. Ve al servicio del frontend
2. Busca la opción "Rebuild" o "Redeploy"
3. Marca la opción "Clear cache" o "No cache"
4. Despliega de nuevo

### 5. Usar Dockerfile simplificado para diagnóstico

Si el problema persiste, temporalmente usa `Dockerfile.simple`:

En Hostinger:
- Cambia **Dockerfile Path** a `Dockerfile.simple`
- Despliega
- Revisa los logs para ver qué archivos se generan

### 6. Verificar el Caddyfile

El Caddyfile debe tener:
```
:8080
root * /usr/share/caddy
encode gzip
file_server
try_files {path} /index.html
```

## 🔍 Comandos de Diagnóstico

Si tienes acceso SSH al contenedor:

```bash
# Ver archivos en Caddy
ls -la /usr/share/caddy/

# Debe mostrar:
# - index.html
# - assets/
# - favicon.ico
# etc.

# Verificar Caddyfile
cat /etc/caddy/Caddyfile

# Probar Caddy manualmente
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

## 🐛 Errores Comunes

### Error: "dist folder not found"
**Causa**: El build falló o no se ejecutó
**Solución**: Verifica los logs del build, asegúrate de que `npm run build` se ejecute

### Error: "index.html not found"
**Causa**: Los archivos no se copiaron correctamente
**Solución**: Verifica que el COPY en el Dockerfile apunte a `/app/dist`

### Error: "Cannot find module"
**Causa**: Dependencias no se instalaron correctamente
**Solución**: Asegúrate de que `npm ci` se ejecute antes del build

## 📝 Checklist de Verificación

- [ ] El repositorio tiene el archivo `Dockerfile` en la raíz
- [ ] El archivo `.env.production` tiene la URL correcta del backend
- [ ] En Hostinger, Dockerfile Path = `Dockerfile`
- [ ] En Hostinger, Context Path = `.`
- [ ] El puerto configurado es `8080`
- [ ] Los logs muestran que `npm run build` se ejecutó
- [ ] Los logs muestran "Build completado exitosamente"
- [ ] No hay errores en los logs de construcción

## 🆘 Si nada funciona

Prueba este Dockerfile ultra-simple:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
```

Guárdalo como `Dockerfile.serve` y úsalo temporalmente para verificar que el build funciona.
