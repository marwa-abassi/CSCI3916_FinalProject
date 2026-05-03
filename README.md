# Personal Contact Manager

Full-stack contacts app with a REST API + a simple UI.

## Tech

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite)

## Features

- Create contacts (Name, Email, Phone, Type: Personal/Professional)
- View all contacts
- Search contacts (name/email/phone)
- Filter by type
- Edit and delete contacts
- Timestamps (createdAt/updatedAt)

## Setup

### 1) Install dependencies

From the project root:

```bash
npm install
```

### 2) Configure environment variables

Create `server/.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/contact_manager
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### 3) Run MongoDB

Use MongoDB locally

```bash
docker compose up -d
```

### 4) Run the app (backend + frontend)

```bash
npm run dev
```

- API: `http://localhost:5000/api/contacts`
- UI: `http://localhost:5173`

## API

Base URL: `/api/contacts`

- `GET /api/contacts?search=&type=`: list + search + filter
- `GET /api/contacts/:id`: get one
- `POST /api/contacts`: create
- `PUT /api/contacts/:id`: update
- `DELETE /api/contacts/:id`: delete

### Contact shape

```json
{
  "_id": "...",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "555-555-5555",
  "type": "Personal",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

