# Order System Backend

Backend API for the Food Order System built with NestJS, TypeORM, and PostgreSQL.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure your database credentials.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=order_system
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

Swagger API documentation is available at `/api/docs` when the server is running.

## Project Structure

- `src/modules/`: Business logic modules (Auth, Users, Restaurants, Menu, Orders, Reviews).
- `src/common/`: Shared utilities, guards, strategies, filters.
- `src/main.ts`: Application entry point.
