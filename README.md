# Administrador de Notas

Una aplicación web completa para gestionar notas personales con autenticación segura, dividida en un frontend moderno y dos microservicios backend.

## 📋 Descripción General

Este proyecto está dividido en tres partes principales:

1. **Frontend Web** (`FE_web`): Interfaz web moderna construida con React y TypeScript
2. **Backend de Autenticación** (`BE_auth`): Servicio de autenticación y gestión de usuarios. Escrita en Node.js
3. **Backend de Notas** (`BE_notes`): Servicio para gestionar notas del usuario. Escrita en Node.js

---

## 🛠️ Tecnologías Utilizadas

### Frontend - `FE_web`

- **React 18** + **TypeScript**: Framework frontend con tipado estático
- **Vite**: Herramienta de construcción rápida
- **Tailwind CSS**: Framework de estilos utilitarios
- **Shadcn/ui**: Librería de componentes accesibles
- **React Query**: Gestión de estado y sincronización de datos
- **React Hook Form**: Gestión eficiente de formularios
- **MD Editor**: Editor de markdown integrado
- **Lucide React**: Iconos modernos
- **date-fns**: Manipulación de fechas
- **Bun**: Gestor de paquetes (lockfile bun.lockb)

### Backend de Autenticación - `BE_auth`

- **Node.js** + **Express 5**: Framework web
- **Mongoose 8.20**: ODM para MongoDB
- **JWT (jsonwebtoken)**: Autenticación basada en tokens
- **bcrypt**: Hash seguro de contraseñas
- **CORS**: Manejo de solicitudes entre dominios
- **dotenv**: Gestión de variables de entorno
- **Nodemon**: Recarga automática en desarrollo

### Backend de Notas - `BE_notes`

- **Node.js** + **Express 5**: Framework web
- **Mongoose 8.20**: ODM para MongoDB
- **CORS**: Manejo de solicitudes entre dominios
- **dotenv**: Gestión de variables de entorno
- **Nodemon**: Recarga automática en desarrollo

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Node.js v18+ o superior
- MongoDB (servidor local en puerto 27017 o configurado en variables de entorno)
- npm, yarn, o bun como gestor de paquetes

### 1. Backend de Autenticación (`BE_auth`)

```bash
# Navegar a la carpeta
cd BE_auth

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-recarga)
npm run dev
```

**Puerto por defecto**: `9001`
**Variables de entorno** (`.env`):
```properties
PORT=9001
JWT_SECRET="gPmdqZK2pei4Ewjc6/1Z+bShwPEw4B6zn5Sr+B4ivFk="
DB_CONNECTION="mongodb://localhost:27017/auth-service"
```

### 2. Backend de Notas (`BE_notes`)

```bash
# Navegar a la carpeta
cd BE_notes

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-recarga)
npm run dev
```

**Puerto por defecto**: `9002`
**Variables de entorno** (`.env`):
```properties
PORT=9002
AUTH_URL="http://localhost:9001/auth"
DB_CONNECTION="mongodb://localhost:27017/notes-service"
```

### 3. Frontend Web (`FE_web`)

```bash
# Navegar a la carpeta
cd FE_web

# Instalar dependencias
npm install
# o si usas bun:
bun install

# Ejecutar en modo desarrollo
npm run dev
# o con bun:
bun run dev

# Construir para producción
npm run build
```

**Puerto por defecto**: `8080`
**Variables de entorno** (`.env`):
```properties
VITE_AUTH_BASE_URL=http://localhost:9001/auth
VITE_NOTES_BASE_URL=http://localhost:9002/notes
```

---

## 📡 Endpoints HTTP

### Backend de Autenticación (`BE_auth`) - Puerto 9001

**URL Base**: `http://localhost:9001/auth`

#### 1. Registrar Usuario
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miPassword123"
}
```
**Respuesta (201)**:
```json
{
  "message": "Created successfully",
  "id": "user_id_123",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```
**Validaciones**:
- Email es obligatorio y debe ser válido
- Contraseña es obligatoria y mínimo 8 caracteres
- Email no debe estar en uso

#### 2. Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "miPassword123"
}
```
**Respuesta (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "user_id_123",
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

#### 3. Verificar Token JWT
```http
GET /auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Respuesta (200)**:
```json
{
  "userId": "user_id_123",
  "email": "juan@example.com",
  "iat": 1705310400,
  "exp": 1705396800
}
```
**Respuesta de Error (401)**:
```json
{
  "error": "Invalid or expired token"
}
```

---

### Backend de Notas (`BE_notes`) - Puerto 9002

**URL Base**: `http://localhost:9002/notes`

⚠️ **Nota importante**: Todos los endpoints requieren autenticación con JWT en el header `Authorization`.

#### 1. Listar Todas las Notas del Usuario
```http
GET /notes/
Authorization: Bearer <JWT_TOKEN>
```
**Respuesta (201)**:
```json
{
  "notes": [
    {
      "_id": "note_id_1",
      "userId": "user_id_123",
      "title": "Mi Primera Nota",
      "fileKey": "uuid.md",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Obtener una Nota Específica
```http
GET /notes/:id
Authorization: Bearer <JWT_TOKEN>
```
**Parámetros de URL**:
- `id`: ID de la nota (ObjectId de MongoDB)

**Respuesta (200)**:
```json
{
  "note": {
    "_id": "note_id_1",
    "userId": "user_id_123",
    "title": "Mi Primera Nota",
    "content": "# Contenido en Markdown...",
    "fileKey": "uuid.md",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. Crear una Nueva Nota
```http
POST /notes/
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Nueva Nota",
  "content": "# Encabezado\n\nContenido en markdown..."
}
```
**Respuesta (201)**:
```json
{
  "message": "Note created successfully",
  "note": {
    "_id": "note_id_new",
    "userId": "user_id_123",
    "title": "Nueva Nota",
    "fileKey": "uuid.md",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### 4. Actualizar una Nota
```http
PUT /notes/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Nota Actualizada",
  "content": "# Nuevo contenido..."
}
```
**Parámetros de URL**:
- `id`: ID de la nota a actualizar

**Respuesta (200)**:
```json
{
  "message": "Note updated successfully",
  "note": {
    "_id": "note_id_1",
    "userId": "user_id_123",
    "title": "Nota Actualizada",
    "fileKey": "uuid.md",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:15:00Z"
  }
}
```

#### 5. Eliminar una Nota
```http
DELETE /notes/:id
Authorization: Bearer <JWT_TOKEN>
```
**Parámetros de URL**:
- `id`: ID de la nota a eliminar

**Respuesta (200)**:
```json
{
  "message": "Note deleted successfully"
}
```

**Respuestas de Error Comunes**:
- `401 Unauthorized`: Token faltante, inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para acceder a esa nota
- `404 Not Found`: La nota no existe

---

## 📁 Estructura de Carpetas

```
notes-app/
├── BE_auth/                 # Backend de Autenticación
│   ├── src/
│   │   ├── controllers/     # Lógica de autenticación
│   │   ├── models/          # Modelo de usuario (Mongoose)
│   │   └── routes/          # Definición de rutas
│   ├── server.js            # Configuración del servidor
│   ├── package.json
│   └── .env                 # Variables de entorno
├── BE_notes/                # Backend de Notas
│   ├── src/
│   │   ├── controllers/     # Lógica de gestión de notas
│   │   ├── models/          # Modelo de nota (Mongoose)
│   │   ├── routes/          # Definición de rutas
│   │   └── utils/           # Herramientas de verificación
│   ├── server.js            # Configuración del servidor
│   ├── package.json
│   └── .env                 # Variables de entorno
├── FE_web/                  # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Llamadas a API
│   │   ├── contexts/        # Context API
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilidades
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── .env                 # Variables de entorno
├── notes/                   # Directorio para almacenar archivos de notas
└── README.md
```

---

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. El usuario se registra o inicia sesión con sus credenciales
2. El servidor devuelve un JWT que debe incluirse en futuras solicitudes
3. El JWT se envía en el header `Authorization: Bearer <token>`
4. El backend de notas valida el token antes de procesar cualquier solicitud

**Secreto JWT**: Se configura en `BE_auth/.env` (`JWT_SECRET`)

---

## 💾 Base de Datos

La aplicación utiliza **MongoDB** con dos bases de datos separadas:

- **auth-service**: Almacena información de usuarios
  - Colección: `users`
- **notes-service**: Almacena metadatos de notas
  - Colección: `notes`

Las notas se almacenan como archivos Markdown en la carpeta `/notes`

---

## ⚙️ Variables de Entorno

Cada servicio requiere su propio archivo `.env`:

### BE_auth/.env
```properties
PORT=9001
JWT_SECRET=<tu_secreto_jwt>
DB_CONNECTION=mongodb://localhost:27017/auth-service
```

### BE_notes/.env
```properties
PORT=9002
AUTH_URL=http://localhost:9001/auth
DB_CONNECTION=mongodb://localhost:27017/notes-service
```

### FE_web/.env
```properties
VITE_AUTH_BASE_URL=http://localhost:9001/auth
VITE_NOTES_BASE_URL=http://localhost:9002/notes
```

---

## 📝 Características

- ✅ Autenticación segura con JWT
- ✅ Hash de contraseñas con bcrypt
- ✅ CRUD completo de notas
- ✅ Editor de Markdown integrado
- ✅ Interfaz moderna y responsiva
- ✅ Protección de rutas en frontend
- ✅ Validaciones en servidor y cliente
- ✅ Almacenamiento de notas en Markdown

---

## 🤝 Notas Adicionales

- Los servidores backend tienen **CORS habilitado** para permitir solicitudes desde el frontend
- El backend de notas implementa **caché-busting** para prevenir respuestas 304 con datos obsoletos
- Las contraseñas se hashean con **bcrypt** antes de almacenarse
- Los tokens JWT incluyen información del usuario y una fecha de expiración

---

