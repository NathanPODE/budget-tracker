# Budget Tracker

A full-stack personal budget tracker: React, Express, PostgreSQL, JWT authentication.

## Running with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop).

1. Clone this repository.
2. Copy `.env.example` to `.env` and set a real `JWT_SECRET`:
```bash
   cp .env.example .env
```
   Generate one with:
```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
3. Start everything:
```bash
   docker compose up --build
```
4. Visit `http://localhost:5173`.

The database schema is created automatically on first run. Data persists across restarts; to reset it entirely, run `docker compose down -v`.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Express, PostgreSQL, bcrypt, JWT
- **Containerized with Docker Compose**
