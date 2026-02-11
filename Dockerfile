# Dockerfile para el Frontend (React + Vite)
# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --verbose

# Copiar el resto del código fuente
COPY . .

# Verificar que los archivos necesarios existen
RUN ls -la && \
    test -f vite.config.ts && \
    test -f index.html && \
    echo "✅ Archivos de configuración encontrados"

# Build de producción con logs detallados
RUN npm run build && \
    ls -la dist/ && \
    test -f dist/index.html && \
    echo "✅ Build completado exitosamente"

# Etapa 2: Producción con Caddy
FROM caddy:2-alpine

# Copiar los archivos estáticos desde el builder
COPY --from=builder /app/dist /usr/share/caddy

# Verificar que los archivos se copiaron
RUN ls -la /usr/share/caddy && \
    test -f /usr/share/caddy/index.html && \
    echo "✅ Archivos copiados a Caddy correctamente"

# Copiar el Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Verificar el Caddyfile
RUN cat /etc/caddy/Caddyfile && \
    caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

# Exponer el puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080 || exit 1

# Caddy se ejecuta automáticamente con el CMD por defecto
