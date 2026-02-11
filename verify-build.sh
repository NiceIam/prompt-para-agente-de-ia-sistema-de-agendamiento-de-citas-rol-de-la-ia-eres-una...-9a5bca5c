#!/bin/bash
# Script para verificar que el build se completó correctamente

echo "Verificando build..."

if [ ! -d "dist" ]; then
  echo "❌ ERROR: La carpeta dist no existe"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ ERROR: dist/index.html no existe"
  exit 1
fi

echo "✅ Build verificado correctamente"
echo "Archivos en dist:"
ls -lah dist/
