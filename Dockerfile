# Dockerfile para el Frontend (React + Vite)
# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Producción con Caddy
FROM caddy:2-alpine

# Copiar los archivos estáticos desde el builder
COPY --from=builder /app/dist /usr/share/caddy

# Copiar el Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Exponer el puerto
EXPOSE 8080

# Caddy se ejecuta automáticamente con el CMD por defecto
