# ERP - Sistema de Gestión Empresarial

Sistema web completo con frontend (HTML5, CSS, Bootstrap, JavaScript) y backend (TypeScript, Express, TypeORM, SQLite).

## 🚀 Características

- **Frontend**: Página web moderna con Bootstrap 5
- **Backend**: API REST con TypeScript y Express
- **Base de Datos**: SQLite (fácil de cambiar a PostgreSQL)
- **Autenticación**: JWT (JSON Web Tokens)
- **Módulos**: Nómina y Finanzas

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. El archivo `.env` ya está configurado con valores por defecto. Si necesitas cambiarlo, edita el archivo `.env` en la raíz del proyecto.

## 🏃 Ejecución

### Modo Desarrollo

Para ejecutar el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### Modo Producción

1. Compilar TypeScript:
```bash
npm run build
```

2. Ejecutar el servidor:
```bash
npm start
```

## 📱 Uso

1. Abre `index.html` en tu navegador (o usa un servidor local como Live Server)
2. Inicia sesión con las credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

## 🔐 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

Estas credenciales se crean automáticamente la primera vez que se ejecuta el servidor.

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `GET /api/auth/profile` - Obtener perfil del usuario (requiere autenticación)

### Nómina
- `GET /api/nomina` - Obtener todas las nóminas
- `GET /api/nomina/:id` - Obtener una nómina por ID
- `POST /api/nomina` - Crear nueva nómina
- `PUT /api/nomina/:id` - Actualizar nómina
- `DELETE /api/nomina/:id` - Eliminar nómina

### Finanzas
- `GET /api/finanzas` - Obtener todas las finanzas
- `GET /api/finanzas/resumen` - Obtener resumen financiero
- `GET /api/finanzas/:id` - Obtener una finanza por ID
- `POST /api/finanzas` - Crear nueva finanza
- `PUT /api/finanzas/:id` - Actualizar finanza
- `DELETE /api/finanzas/:id` - Eliminar finanza

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🗂️ Estructura del Proyecto

```
erp/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de base de datos
│   ├── controllers/
│   │   ├── auth.controller.ts   # Controlador de autenticación
│   │   ├── nomina.controller.ts # Controlador de nómina
│   │   └── finanzas.controller.ts # Controlador de finanzas
│   ├── entities/
│   │   ├── User.ts              # Entidad Usuario
│   │   ├── Nomina.ts            # Entidad Nómina
│   │   └── Finanza.ts           # Entidad Finanza
│   ├── middleware/
│   │   └── auth.middleware.ts   # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.routes.ts       # Rutas de autenticación
│   │   ├── nomina.routes.ts     # Rutas de nómina
│   │   └── finanzas.routes.ts   # Rutas de finanzas
│   ├── services/
│   │   ├── auth.service.ts      # Servicio de autenticación
│   │   ├── nomina.service.ts    # Servicio de nómina
│   │   └── finanzas.service.ts  # Servicio de finanzas
│   ├── utils/
│   │   └── jwt.util.ts          # Utilidades JWT
│   └── app.ts                   # Aplicación principal
├── index.html                   # Página principal del frontend
├── styles.css                   # Estilos personalizados
├── script.js                    # JavaScript del frontend
├── package.json                 # Dependencias del proyecto
├── tsconfig.json                # Configuración de TypeScript
└── .env                         # Variables de entorno
```

## 🔄 Cambiar a PostgreSQL

Si prefieres usar PostgreSQL en lugar de SQLite:

1. Edita el archivo `.env`:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_DATABASE=sistema_gestion
```

2. Instala el driver de PostgreSQL:
```bash
npm install pg
npm install -D @types/pg
```

3. Descomenta las líneas correspondientes en `src/config/database.ts`

## 📝 Notas

- La base de datos SQLite se crea automáticamente en `./database.sqlite`
- En producción, cambia el `JWT_SECRET` en el archivo `.env`
- El modo `synchronize: true` en TypeORM solo debe usarse en desarrollo. En producción, usa migraciones.

## 🐛 Solución de Problemas

Si encuentras errores al iniciar el servidor:

1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Verifica que el puerto 3000 no esté en uso
3. Revisa los logs del servidor para más detalles

## 📄 Licencia

ISC





