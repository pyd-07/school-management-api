# School Management API

A REST API built with Node.js, Express, TypeScript, and MySQL to manage school data. Supports adding schools and retrieving them sorted by proximity to a given location.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL (hosted on Railway)
- **Hosting:** Railway

---

## Project Structure

```
school-management-api/
├── src/
│   ├── config/
│   │   ├── db.ts          # MySQL connection pool
│   │   └── init.ts        # Table creation script (run once)
│   ├── routes/
│   │   └── schools.ts     # API route handlers
│   ├── utils/
│   │   └── distance.ts    # Haversine distance formula
│   └── index.ts           # Express app entry point
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MySQL database URL (Railway, Aiven, or any cloud MySQL provider)

### Local Setup

1. Clone the repository

```bash
git clone https://github.com/pyd-07/school-management-api.git
cd school-management-api
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
touch .env
```

Edit `.env` and add your MySQL connection URL:

```env
MYSQL_URL=mysql://user:password@host:port/dbname
PORT=3000
```

4. Create the database table

```bash
npx ts-node src/config/init.ts
```

This creates the `schools` table if it doesn't already exist. Safe to run multiple times.

5. Start the development server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`.

---

## API Reference

### POST `/addSchool`

Adds a new school to the database.

**Request Body**

```json
{
  "name": "Delhi Public School",
  "address": "Sector 45, Noida, UP",
  "latitude": 28.5612,
  "longitude": 77.3710
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | Non-empty |
| address | string | Yes | Non-empty |
| latitude | number | Yes | Between -90 and 90 |
| longitude | number | Yes | Between -180 and 180 |

**Response `201`**

```json
{
  "message": "School added successfully",
}
```

**Response `400`** (validation failure)

```json
{
  "error": "latitude must be between -90 and 90"
}
```

---

### GET `/listSchools`

Returns all schools sorted by distance from the given coordinates (nearest first).

**Query Parameters**

| Parameter | Type | Required |
|---|---|---|
| latitude | number | Yes |
| longitude | number | Yes |

**Example Request**

```
GET /listSchools?latitude=28.6139&longitude=77.2090
```

**Response `200`**

```json
{
  "count": 2,
  "schools": [
    {
      "id": 1,
      "name": "Delhi Public School",
      "address": "Sector 45, Noida, UP",
      "latitude": 28.5612,
      "longitude": 77.3710,
      "distance": 18.42
    },
    {
      "id": 2,
      "name": "Springdales School",
      "address": "Pusa Road, New Delhi",
      "latitude": 28.6390,
      "longitude": 77.1750,
      "distance": 3.91
    }
  ]
}
```

The `distance` field is in kilometers, calculated using the Haversine formula.

**Response `400`** (missing or invalid params)

```json
{
  "error": "latitude query param is required and must be a number"
}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with ts-node and nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output (production) |

---

## Deployment

This project is deployed on Railway.

**Build command**

```bash
npm install && npm run build
```

**Start command**

```bash
node dist/index.js
```

Set the `MYSQL_URL` environment variable in your Railway service settings.

**Live API:** `https://school-management-api-educase.up.railway.app/`

---

## Postman Collection

A Postman collection with example requests and responses is available here:

[View Collection](https://piyush0107-7113029.postman.co/workspace/piyush0107's-Workspace~778a79e8-ee72-4f16-87b9-1236e243748e/collection/49139819-48d9674f-a4ae-4de5-a7a8-05d2f11979dc?action=share&creator=49139819)

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS schools (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  address   VARCHAR(255) NOT NULL,
  latitude  FLOAT NOT NULL,
  longitude FLOAT NOT NULL
);
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `MYSQL_URL` | Full MySQL connection URL |
| `PORT` | Port for the Express server (default: 3000) |

Create a `.env.example` file with:

```env
MYSQL_URL=mysql://user:password@host:port/dbname
PORT=3000
```