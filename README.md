# Todo App

A full-stack Google Tasks-inspired todo application.

## Tech Stack

- **Backend**: Node.js, NestJS, Prisma, PostgreSQL
- **Frontend**: Angular 17 (standalone components), SCSS, Angular CDK drag-drop
- **Architecture**: Simplified hexagonal architecture (Domain → Application Ports → Infrastructure)
- **Auth**: JWT (RS256) + scrypt password hashing
- **API**: OpenAPI 3.0 + generated TypeScript SDK
- **Testing**: Playwright + Node.js native test runner

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for PostgreSQL)
- Java 11+ (for openapi-generator-cli, optional)

## Quick Start

### 1. Run everything with one command

```bash
npm run dev
```

This command automatically:

- Creates `.env` from `.env.example` if missing
- Generates JWT RSA keys and stores them in `.env` if missing
- Installs workspace dependencies
- Starts PostgreSQL via Docker Compose
- Runs backend Prisma migrations
- Starts backend on port 3000 and frontend on port 4200

### 2. Open the app

Open [http://localhost:4200](http://localhost:4200)

## Project Structure

```
cloudtalk-test-task/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── domain/           # Pure business entities
│   │   ├── application/
│   │   │   ├── ports/        # Abstract repository interfaces
│   │   │   └── services/     # Business logic + HTTP controllers
│   │   ├── infra/
│   │   │   ├── persistence/  # Prisma repositories
│   │   │   ├── http/         # Controllers + DTOs
│   │   │   └── env/          # Environment validation
│   │   └── lib/              # Guards, decorators, utils
│   └── prisma/               # Schema + migrations
├── frontend/                 # Angular application
│   └── src/app/
│       ├── core/             # Auth service, interceptor, guards
│       ├── features/         # Auth + Tasks feature modules
│       └── shared/           # Reusable components
├── sdk/                      # Auto-generated OpenAPI SDK
├── e2e/                      # Playwright + Node.js tests
│   ├── tests/api/            # API tests (Node.js native test runner)
│   └── tests/ui/             # UI tests (Playwright)
└── docker-compose.yml
```

## API Documentation

With the backend running, visit: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Regenerate SDK

```bash
cd backend
npm run generate:sdk     # Requires backend to be running on port 3000
```

## Run E2E Tests

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Set test DB URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/todo_test"

# Run backend in test mode
cd backend && NODE_ENV=test npm run start

# API tests (Node.js native test runner)
cd e2e
npm run test:api

# UI tests (Playwright, requires frontend running)
npm run test:ui
```

## Features

- **Authentication**: Register/login with JWT (RS256, 7-day expiry)
- **Task Lists**: Create, rename, delete, reorder lists
- **Tasks**: Create, edit, complete, delete tasks with notes
- **Drag-and-drop**: Move tasks between lists and reorder within a list
- **Google Tasks layout**: Sidebar + horizontal columns board view
