# Dockerfile para el Backend (Express + Node.js)

FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el código del servidor
COPY server.js ./
COPY .env.example ./

# Crear directorio para credentials (se montará como volumen o se copiará manualmente)
RUN mkdir -p /app

# Exponer el puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["node", "server.js"]
