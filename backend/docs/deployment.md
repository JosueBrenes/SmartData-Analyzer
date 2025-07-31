# Guía de Despliegue del Backend

## Entornos de despliegue

### Desarrollo local
```bash
# Instalar dependencias
pip install -r backend/docs/requirements.txt

# Ejecutar análisis directo
python backend/analyze.py path/to/file.csv

# Con el frontend Next.js
npm run dev  # El frontend llama automáticamente al backend
```

### Producción

#### Opción 1: Despliegue tradicional
```bash
# Servidor con Python
pip install -r backend/docs/requirements.txt

# Asegurar que el script esté en la ruta correcta
# El frontend debe poder ejecutar: python backend/analyze.py
```

#### Opción 2: Contenedor Docker
```dockerfile
# Dockerfile para el proyecto completo
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM python:3.10-slim AS backend
WORKDIR /app
COPY backend/docs/requirements.txt backend/docs/
RUN pip install -r backend/docs/requirements.txt
COPY backend/ backend/

FROM node:18-alpine AS runtime
RUN apk add --no-cache python3 py3-pip
WORKDIR /app

# Copiar backend
COPY --from=backend /app/backend backend/
COPY --from=backend /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Copiar frontend
COPY --from=frontend /app/frontend/.next frontend/.next/
COPY --from=frontend /app/frontend/public frontend/public/
COPY --from=frontend /app/frontend/package*.json frontend/
COPY --from=frontend /app/frontend/node_modules frontend/node_modules/

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "start"]
```

#### Opción 3: Servicios serverless

**Vercel + Railway/Render**:
- Frontend en Vercel
- Backend Python como servicio separado
- Comunicación vía HTTP API

**AWS Lambda**:
- Función Lambda con runtime Python 3.10
- API Gateway para exposición HTTP
- S3 para almacenamiento temporal de archivos

## Variables de entorno

### Frontend (Next.js)
```env
# .env.local
PYTHON_COMMAND=python3  # o 'python' en Windows
BACKEND_PATH=../backend/analyze.py
```

### Backend
```env
# Variables de sistema
PYTHONPATH=/app/backend
TEMP_DIR=/tmp  # Directorio para archivos temporales
```

## Configuración de servidor

### Nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Aumentar límites para uploads
    client_max_body_size 100M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
}
```

### PM2 (Process Manager)
```json
{
  "name": "smartdata-analyzer",
  "script": "npm",
  "args": "start",
  "cwd": "./frontend",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  },
  "instances": 1,
  "exec_mode": "fork"
}
```

## Monitoreo y logs

### Logs del backend
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/smartdata/backend.log'),
        logging.StreamHandler()
    ]
)
```

### Logs del frontend
Los logs del proceso Python aparecen en la consola de Next.js:
```bash
# Desarrollo
npm run dev

# Producción
pm2 logs smartdata-analyzer
```

### Métricas recomendadas
- Tiempo de procesamiento por archivo
- Tamaño de archivos procesados
- Errores de análisis Python
- Uso de memoria durante clustering
- Número de requests por minuto

## Seguridad

### Validación de archivos
```python
ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def validate_file(filename, size):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported extension: {ext}")
    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large: {size} bytes")
```

### Sandboxing
```bash
# Ejecutar Python en entorno restringido
firejail --seccomp --private-tmp python backend/analyze.py file.csv
```

### Rate limiting
```javascript
// middleware.js
import { NextResponse } from 'next/server'

const rateLimiter = new Map()

export function middleware(request) {
  if (request.nextUrl.pathname === '/api/analyze') {
    const ip = request.ip || 'anonymous'
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minuto
    const maxRequests = 10
    
    const requests = rateLimiter.get(ip) || []
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
    
    validRequests.push(now)
    rateLimiter.set(ip, validRequests)
  }
  
  return NextResponse.next()
}
```

## Troubleshooting

### Error común: Python no encontrado
```bash
# Verificar instalación
which python3
python3 --version

# En el código Next.js, ajustar:
const pythonCommand = process.platform === "win32" ? "python" : "python3";
```

### Error: Módulos Python faltantes
```bash
pip install -r backend/docs/requirements.txt
pip list  # Verificar instalación
```

### Error: Permisos de archivos temporales
```bash
# Asegurar permisos en directorio temporal
chmod 755 /tmp
chown www-data:www-data /tmp  # Si usa Apache/Nginx
```

### Error: Timeout en análisis grandes
```javascript
// Aumentar timeout en Next.js
export const maxDuration = 300; // 5 minutos
```

### Memoria insuficiente
```python
# Monitorear uso de memoria
import psutil
process = psutil.Process()
print(f"Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")
```

## Backup y recuperación

### Datos críticos
- Código fuente (repositorio Git)
- Logs de errores
- Configuración de producción

### No requiere backup
- Archivos temporales (se auto-eliminan)
- Resultados de análisis (no se persisten)
- Caché del sistema

### Script de backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=__pycache__ \
  frontend/ backend/
```