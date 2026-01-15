# UCAB Tasks API - Prototipo

Este proyecto es un prototipo de una API REST para la gestión de notas de texto, desarrollado como parte de la asignatura Tópicos Especiales de Programación en la UCAB.

## 📋 Descripción

El objetivo es evaluar la factibilidad de una aplicación de gestión de notas. El prototipo permite:
- Crear, obtener, actualizar y eliminar notas (CRUD).
- Filtrar notas por título o contenido.
- Ordenar por fecha de creación, modificación o título.
- Persistencia de datos en archivos de texto (JSON) abstraída para futuros cambios de base de datos.

## 🛠 Tecnologías Utilizadas

- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **Entorno:** Node.js
- **Pruebas:** Jest (Unitarias y E2E)
- **Doumentación:** Swagger y JSDoc

## 🚀 Requisitos de Ejecución

- [Node.js](https://nodejs.org/) (Versión recomendada: v18 o superior)
- [NPM](https://www.npmjs.com/) (Incluido con Node.js)
- Visual Studio Code (Recomendado para revisión)

## 🔧 Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd ucab-tasks-mn-m
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```
   Esto instalará todas las librerías necesarias definidas en `package.json`.

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run start:dev
   ```
   El servidor iniciará en `http://localhost:3000`.

4. **Verificar que funciona:**
   - Abre tu navegador y ve a `http://localhost:3000/api` para ver la documentación interactiva en Swagger.
   - O realiza una petición GET a `http://localhost:3000/notes`.

## 🧪 Ejecución de Pruebas

El proyecto cuenta con pruebas automatizadas para garantizar su funcionamiento.

### Pruebas Unitarias
Ejecuta las pruebas de los servicios y controladores aislados:
```bash
npm run test
```

### Pruebas de Integración (E2E)
Verifica el flujo completo de la API (Endpoints -> Controlador -> Servicio -> Repositorio):
```bash
npm run test:e2e
```

## 📚 Documentación de API

La API está documentada con **Swagger**. 
Una vez iniciada la aplicación, visita:
[http://localhost:3000/api](http://localhost:3000/api)

### Endpoints Principales

- `GET /notes`: Listado general (filtros: `search`, `sortBy`, `order`). Resumen de notas (sin contenido).
- `GET /notes/:id`: Detalle de una nota (incluye contenido).
- `POST /notes`: Crear una nota. Body: `{ "title": "...", "content": "..." }`.
- `PATCH /notes/:id`: Actualizar nota. Body: `{ "title": "..." }` (Parcial). Actualiza `updatedAt` automáticamente.
- `DELETE /notes`: Eliminación masiva. Body: `{ "ids": ["uuid1", "uuid2"] }`.

## 🏗 Arquitectura y Patrones

- **Repository Pattern:** La persistencia se maneja a través de interfaces (`INotesRepository`), implementada actualmente con `JsonNotesRepository`. Esto permite cambiar a MongoDB o SQL sin tocar la lógica de negocio.
- **Factory Pattern:** Creación de entidades Note consistente.
- **DTOs:** Validación de datos de entrada y salida.

## 👥 Equipo
- Maurizio Brazon
- Marco Cegarra
