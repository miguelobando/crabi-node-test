# API de Usuarios - NestJS

Esta API proporciona servicios para la gestión de usuarios, incluyendo registro, autenticación y consulta de información.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Yarn
- Docker y Docker Compose
- PostgreSQL 16

## 🚀 Inicio Rápido

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

2. **Configurar variables de ambiente**

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=postgrespassword
DB_USERNAME=postgres
DB_NAME=database
DB_SCHEMA=public
DB_SYNC=true
DB_POOL_SIZE=10
PLD_ENDPOINT=http://98.81.235.22
SECRET_KEY=MIGUEL123
```

3. **Instalar dependencias**

```bash
yarn install
```

## 💻 Desarrollo Local

### Opción 1: Desarrollo con Base de Datos en Docker (Recomendado)

1. Iniciar la base de datos:

```bash
cd infra
docker-compose up
```

2. En otra terminal, iniciar la aplicación en modo desarrollo:

```bash
yarn start:dev
```

La aplicación estará disponible en `http://localhost:3000`

### Opción 2: Todo en Docker

```bash
cd infra
docker-compose up --build
```

## 📝 Documentación de la API

La documentación de la API está disponible a través de Swagger UI en:

```
http://localhost:3000/docs
```

### Endpoints Principales

#### 1. Registro de Usuario

- **POST** `/users/register`
- Crea un nuevo usuario
- Verifica si el usuario está en lista negra
- **Estado 201**: Usuario creado exitosamente
- **Estado 406**: Usuario en lista negra
- **Estado 503**: Servicio no disponible

#### 2. Login

- **POST** `/users/login`
- Autentica al usuario con email y contraseña
- Retorna token JWT
- **Estado 200**: Login exitoso
- **Estado 401**: Credenciales inválidas

#### 3. Información de Usuario

- **GET** `/users/info`
- Requiere token JWT en header (`Authorization: Bearer <token>`)
- Retorna información del usuario actual
- **Estado 200**: Información recuperada exitosamente
- **Estado 401**: Token inválido o faltante
- **Estado 404**: Usuario no encontrado

## 🛠️ Tecnologías Utilizadas

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Swagger/OpenAPI
- JWT para autenticación

## 🔧 Scripts Disponibles

```bash
# Desarrollo
yarn start:dev     # Inicia en modo desarrollo con hot-reload

# Producción
yarn build         # Compila el proyecto
yarn start:prod    # Inicia en modo producción

# Testing
yarn test         # Ejecuta tests unitarios
yarn test:e2e     # Ejecuta tests end-to-end
```

## 📦 Estructura del Proyecto

```
/
├── src/                    # Código fuente
├── infra/                  # Configuración de Docker
│   ├── docker-compose.yml  # Configuración de Docker
│   └── init/              # Scripts de inicialización de BD
├── .env                    # Variables de ambiente
└── Dockerfile             # Configuración de Docker
```

### Coleccion de postman

La coleccion de postman se encuentra en el archivo [Crabi Test.postman_collection.json](./Crabi%20Test.postman_collection.json)

# English version

# Users API - NestJS

This API provides user management services, including registration, authentication, and information querying.

## 📋 Prerequisites

- Node.js (v18 or higher)
- Yarn
- Docker and Docker Compose
- PostgreSQL 16

## 🚀 Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd <project-name>
```

2. **Set up environment variables**

Create a `.env` file in the project root with the following content:

```env
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=postgrespassword
DB_USERNAME=postgres
DB_NAME=database
DB_SCHEMA=public
DB_SYNC=true
DB_POOL_SIZE=10
PLD_ENDPOINT=http://98.81.235.22
SECRET_KEY=MIGUEL123
```

3. **Install dependencies**

```bash
yarn install
```

## 💻 Local Development

### Option 1: Development with Docker Database (Recommended)

1. Start the database:

```bash
cd infra
docker-compose up
```

2. In another terminal, start the application in development mode:

```bash
yarn start:dev
```

The application will be available at `http://localhost:3000`

### Option 2: Everything in Docker

```bash
cd infra
docker-compose up --build
```

## 📝 API Documentation

API documentation is available through Swagger UI at:

```
http://localhost:3000/docs
```

### Main Endpoints

#### 1. User Registration

- **POST** `/users/register`
- Creates a new user
- Verifies if the user is blacklisted
- **Status 201**: User successfully created
- **Status 406**: User is blacklisted
- **Status 503**: Service unavailable

#### 2. Login

- **POST** `/users/login`
- Authenticates user with email and password
- Returns JWT token
- **Status 200**: Login successful
- **Status 401**: Invalid credentials

#### 3. User Information

- **GET** `/users/info`
- Requires JWT token in header (`Authorization: Bearer <token>`)
- Returns current user information
- **Status 200**: Information successfully retrieved
- **Status 401**: Invalid or missing token
- **Status 404**: User not found

## 🛠️ Technologies Used

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Swagger/OpenAPI
- JWT for authentication

## 🔧 Available Scripts

```bash
# Development
yarn start:dev     # Starts in development mode with hot-reload

# Production
yarn build         # Builds the project
yarn start:prod    # Starts in production mode

# Testing
yarn test         # Runs unit tests
yarn test:e2e     # Runs end-to-end tests
```

## 📦 Project Structure

```
/
├── src/                    # Source code
├── infra/                  # Docker configuration
│   ├── docker-compose.yml  # Docker configuration
│   └── init/              # DB initialization scripts
├── .env                    # Environment variables
└── Dockerfile             # Docker configuration
```

### Postman Collection

The Postman collection can be found in the [Crabi Test.postman_collection.json](./Crabi%20Test.postman_collection.json) file.
