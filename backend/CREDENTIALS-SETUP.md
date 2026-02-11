# Configurar Credenciales de Google en EasyPanel

## 📋 Opción 1: Variable de Entorno (RECOMENDADO)

Esta es la forma más segura y fácil de configurar las credenciales.

### Pasos:

1. **Abre tu archivo `credentials.json` local** en un editor de texto

2. **Copia TODO el contenido** (es un JSON que se ve así):
   ```json
   {
     "type": "service_account",
     "project_id": "tu-proyecto",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "tu-service-account@tu-proyecto.iam.gserviceaccount.com",
     ...
   }
   ```

3. **En EasyPanel**, ve al servicio del backend

4. **Busca la sección "Environment Variables"** o "Variables de Entorno"

5. **Agrega una nueva variable**:
   - **Nombre**: `GOOGLE_CREDENTIALS`
   - **Valor**: Pega TODO el contenido del JSON (incluyendo las llaves `{}`)

6. **Guarda y redespliega** el servicio

### ✅ Verificación:

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

## 📋 Opción 2: Subir archivo via SSH/SFTP

Si EasyPanel te da acceso SSH o SFTP:

1. Conéctate al servidor
2. Navega a la carpeta del contenedor (usualmente `/app/`)
3. Sube el archivo `credentials.json`
4. Reinicia el contenedor

## 📋 Opción 3: Incluir en el repositorio (NO RECOMENDADO)

⚠️ **PELIGRO**: Esto expone tus credenciales en GitHub

Solo si tu repositorio es PRIVADO:

1. Copia `credentials.json` a la carpeta `backend/`
2. Asegúrate de que `.gitignore` NO incluya `credentials.json`
3. Haz commit y push
4. Redespliega

## 🔒 Seguridad

- **NUNCA** subas `credentials.json` a un repositorio público
- Usa variables de entorno siempre que sea posible
- Rota las credenciales periódicamente
- Limita los permisos de la Service Account solo a lo necesario

## 🐛 Solución de Problemas

### Error: "google: sin credenciales"
- Verifica que la variable `GOOGLE_CREDENTIALS` esté configurada
- Asegúrate de que el JSON esté completo (con llaves de inicio y fin)
- Verifica que no haya espacios extra al inicio o final

### Error: "Invalid JSON"
- El contenido de `GOOGLE_CREDENTIALS` debe ser JSON válido
- Verifica que las comillas estén correctas
- No agregues saltos de línea extra

### Error: "Permission denied"
- La Service Account no tiene permisos en el Google Sheet
- Comparte el Sheet con el email de la Service Account
- Verifica que tenga permisos de "Editor"

## 📝 Ejemplo de Variable de Entorno

En EasyPanel, la variable se vería así:

```
Nombre: GOOGLE_CREDENTIALS
Valor: {"type":"service_account","project_id":"mi-proyecto-123","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"mi-sa@mi-proyecto.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/mi-sa%40mi-proyecto.iam.gserviceaccount.com"}
```

(Todo en una sola línea, sin saltos de línea)
