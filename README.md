# Food Order System · Backend

[![Backend CI](https://github.com/Smokiestfox/food-order-system-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/Smokiestfox/food-order-system-backend/actions/workflows/ci.yml)

A NestJS REST API for browsing restaurants, managing menus, and placing food orders. Built with TypeScript, PostgreSQL, and TypeORM, with JWT authentication and Swagger documentation.

**[Frontend](https://github.com/Smokiestfox/food-order-system-frontend) · [Architecture & ERD](docs/ARCHITECTURE.md) · [Local demo walkthrough](docs/DEMO.md)**

## What is implemented

| Area | Behavior |
| --- | --- |
| Authentication | Register customers/restaurant owners, log in, and retrieve the authenticated profile |
| Authorization | JWT-protected endpoints, role guards, and ownership checks on order details |
| Restaurants & menu | Public browsing; owners manage their restaurants and menu items |
| Orders | Calculate totals from menu prices, record item snapshots, list relevant orders, update status, and cancel pending orders |
| Reviews | Submit a rating/comment, list restaurant reviews, and update the average rating |
| Developer workflow | Swagger, local API + database containers, and PostgreSQL-backed integration tests |

This is a portfolio application. Payment methods are recorded as order data; there is no payment gateway or delivery-provider integration. The local stack uses TypeORM schema synchronization. Versioned migrations, atomic order creation, and stricter order/review lifecycle rules remain follow-up work.

## Run the API and database

Requires Git and Docker Desktop with its engine running.

```sh
git clone https://github.com/Smokiestfox/food-order-system-backend.git
cd food-order-system-backend
cp .env.example .env
docker compose up --build -d
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. The example values are for local development.

- Swagger UI: **http://localhost:3000/api/docs**
- OpenAPI JSON: http://localhost:3000/api/docs-json
- REST base URL: http://localhost:3000/api
- PostgreSQL: localhost:5432 by default

The API waits for the database health check before starting. View logs with `docker compose logs -f api`. Use `docker compose down` to stop this stack while retaining its database volume.

## Run with Node.js

Recommended: Node.js 24 LTS. PostgreSQL 16 is used in Compose and CI.

```sh
git clone https://github.com/Smokiestfox/food-order-system-backend.git
cd food-order-system-backend
npm ci
cp .env.example .env
docker compose up -d postgres
npm run start:dev
```

If you already have PostgreSQL, configure `.env` for that instance and omit the Compose command. `DB_PORT` is the host port in this mode; the API container connects to the Compose database on its internal port 5432.

| Variable | Local example |
| --- | --- |
| `PORT` | `3000` |
| `NODE_ENV` | `development` |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / `postgres` |
| `DB_NAME` | `order_system` |
| `JWT_SECRET` | Set a local signing secret in `.env` |
| `JWT_EXPIRATION` | `7d` |

## Verify the backend

```sh
npm run build
```

Integration tests require a **separate PostgreSQL database whose name ends in `_test`**. They exercise registration, duplicate accounts, login failures, validation, JWT protection, role restrictions, order totals, order visibility, and cancellation rules through HTTP. Test accounts are unique to each run and cleaned up afterward.

For the default local PostgreSQL container, create the test database once:

```sh
docker compose exec postgres psql -U postgres -c "CREATE DATABASE order_system_test;"
```

Then run, using the remaining database settings and JWT secret from `.env`:

```powershell
$env:DB_NAME = 'order_system_test'
npm test
Remove-Item Env:DB_NAME
```

On Bash: `DB_NAME=order_system_test npm test`. GitHub Actions provisions its own test database, runs the suite, validates Compose, and builds the API container.

## Repository structure

```text
src/
  common/          JWT strategies, guards, decorators, error filter
  modules/         Auth, Users, Restaurants, Menu, Orders, Reviews
  configure-app.ts Shared validation, serialization, and HTTP setup
  main.ts          Server bootstrap and Swagger
test/              HTTP integration tests
docs/              Architecture, ERD, and demo walkthrough
```
