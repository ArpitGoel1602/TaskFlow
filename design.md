# TaskFlow – Technical Design Document

---

## 1. System Architecture

TaskFlow follows a classic **three-tier architecture**:

```
┌─────────────────────────────────────────┐
│              Browser (Client)            │
│         React SPA  (Vite + React 19)     │
│   React Router │ Axios │ Context API     │
└────────────────────┬────────────────────┘
                     │ HTTP/JSON (REST API)
┌────────────────────▼────────────────────┐
│             Application Server           │
│         Node.js + Express 5              │
│   Routes │ Controllers │ Middleware      │
└────────────────────┬────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────┐
│               Database Layer             │
│             MongoDB (Atlas / Local)      │
│  Users │ Projects │ Tasks │ Comments     │
│                │ Activity                │
└─────────────────────────────────────────┘
```

- The **frontend** is a React SPA served by Vite's dev server (port 5173).
- The **backend** is an Express REST API running on port 5000.
- CORS is configured on the backend to accept requests only from `http://localhost:5173`.
- All communication is over JSON. JWT tokens are passed in the `Authorization: Bearer <token>` header.

---

## 2. Folder Structure

```
TaskFlow/
├── BACKEND/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # JWT verification
│   │   └── error.middleware.js  # Global error handler
│   ├── models/
│   │   ├── activity.model.js
│   │   ├── comment.model.js
│   │   ├── project.model.js
│   │   ├── task.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── comment.route.js
│   │   ├── dashboard.route.js
│   │   ├── project.route.js
│   │   ├── task.route.js
│   │   └── index.js            # Route aggregator
│   ├── services/
│   │   └── user.service.js
│   ├── app.js                  # Express app setup
│   └── index.js                # Server entry point
│
└── FRONTEND/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── TaskBoard.jsx
        │   └── TaskCard.jsx
        ├── context/
        │   ├── AuthContext.jsx  # Auth state provider
        │   └── useAuth.js       # Auth hook
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Projects.jsx
        │   ├── ProjectDetails.jsx
        │   ├── Tasks.jsx
        │   └── TaskDetails.jsx
        ├── services/
        │   └── api.js           # Axios instance
        ├── App.jsx              # Route definitions
        └── main.jsx             # React entry point
```

---

## 3. Database Design

### 3.1 Entity Relationship Overview

```
User ──< Project (owner)
User >──< Project (members, many-to-many)
Project ──< Task
User ──< Task (assignedTo, createdBy)
Task ──< Comment
User ──< Comment (author)
Project ──< Activity
Task ──< Activity (optional)
User ──< Activity (actor)
```

### 3.2 Collections

#### Users
| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase |
| `passwordHash` | String | Required, select: false |
| `role` | String | Enum: `admin`, `member`; default: `member` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

#### Projects
| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, max 100 chars |
| `description` | String | Default: `""` |
| `owner` | ObjectId → User | Required |
| `members` | [ObjectId → User] | Array of members |
| `deadline` | Date | Optional |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

#### Tasks
| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required, max 150 chars |
| `description` | String | Default: `""` |
| `projectId` | ObjectId → Project | Required |
| `assignedTo` | ObjectId → User | Default: null |
| `createdBy` | ObjectId → User | Required |
| `status` | String | Enum: `todo`, `in_progress`, `review`, `completed`; default: `todo` |
| `priority` | String | Enum: `low`, `medium`, `high`; default: `medium` |
| `dueDate` | Date | Optional |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

#### Comments
| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `taskId` | ObjectId → Task | Required |
| `userId` | ObjectId → User | Required |
| `text` | String | Required, trimmed |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

#### Activities
| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `projectId` | ObjectId → Project | Required |
| `taskId` | ObjectId → Task | Default: null |
| `userId` | ObjectId → User | Required |
| `action` | String | Required (e.g. `task_created`, `task_updated`) |
| `description` | String | Required (human-readable log message) |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

---

## 4. API Design

### Base URL
```
http://localhost:5000
```

### Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

### 4.1 Auth Routes `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT |
| GET | `/auth/me` | Yes | Get current user profile |

**POST /auth/register – Request Body**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**POST /auth/login – Response**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "_id": "...", "name": "Alice", "email": "alice@example.com" }
}
```

---

### 4.2 Project Routes `/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/projects` | Yes | Get all projects for current user |
| POST | `/projects` | Yes | Create a new project |
| GET | `/projects/:id` | Yes | Get a single project |
| PUT | `/projects/:id` | Yes | Update a project |
| DELETE | `/projects/:id` | Yes | Delete a project |

---

### 4.3 Task Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tasks` | Yes | Get tasks assigned to or created by the current user |
| GET | `/projects/:projectId/tasks` | Yes | Get all tasks for a project |
| POST | `/projects/:projectId/tasks` | Yes | Create a task in a project |
| GET | `/tasks/:id` | Yes | Get a single task |
| PATCH | `/tasks/:id` | Yes | Update a task |
| DELETE | `/tasks/:id` | Yes | Delete a task |

---

### 4.4 Comment Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tasks/:taskId/comments` | Yes | Get comments for a task |
| POST | `/tasks/:taskId/comments` | Yes | Add a comment to a task |
| DELETE | `/comments/:id` | Yes | Delete a comment |

---

### 4.5 Dashboard Route

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Yes | Get summary stats (total projects, tasks, completed, overdue) |

**GET /dashboard – Response**
```json
{
  "totalProjects": 4,
  "totalTasks": 18,
  "completedTasks": 7,
  "overdueTasks": 2
}
```

---

## 5. Authentication Flow

```
1. User submits register/login form
         │
         ▼
2. Backend validates input fields
         │
         ▼
3. On register: bcrypt.hash(password, 12) → store passwordHash
   On login:   bcrypt.compare(password, passwordHash)
         │
         ▼
4. jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
         │
         ▼
5. Token returned to frontend → stored in localStorage (via AuthContext)
         │
         ▼
6. Axios instance attaches token to every request:
   Authorization: Bearer <token>
         │
         ▼
7. auth.middleware.js verifies token on each protected route
   → sets req.userId for downstream controllers
```

---

## 6. Frontend Architecture

### 6.1 Routing (React Router v7)

```
/login              → Login.jsx          (public)
/register           → Register.jsx       (public)
/dashboard          → Dashboard.jsx      (protected)
/projects           → Projects.jsx       (protected)
/projects/:id       → ProjectDetails.jsx (protected)
/tasks              → Tasks.jsx          (protected)
/tasks/:id          → TaskDetails.jsx    (protected)
/                   → redirect → /dashboard
*                   → redirect → /
```

Protected routes are wrapped in `<ProtectedRoute />` which checks auth state and redirects unauthenticated users to `/login`.

### 6.2 Auth State (React Context)

`AuthContext.jsx` manages:
- `user` – current user object (or null)
- `token` – JWT string (or null)
- `login(token, user)` – stores token in localStorage, sets state
- `logout()` – clears localStorage and state

`useAuth.js` exposes the context via a custom hook used throughout the app.

### 6.3 API Layer (Axios)

`services/api.js` creates an Axios instance with:
- `baseURL` from `VITE_API_URL` environment variable
- Request interceptor that injects the JWT from localStorage into every outgoing request header

### 6.4 Component Hierarchy

```
App.jsx
├── <Login />
├── <Register />
└── <ProtectedRoute>
    └── <AppLayout>
        ├── <Navbar />
        ├── <Sidebar />
        └── <main>
            ├── <Dashboard />
            ├── <Projects />
            ├── <ProjectDetails>
            │   └── <TaskBoard>
            │       └── <TaskCard />
            ├── <Tasks />
            └── <TaskDetails />
```

---

## 7. Key Design Decisions

### Access Control
Rather than a complex role system, access is controlled by **project membership**:
- A user can only view/edit tasks in projects they own or are a member of.
- The `canAccess(project, userId)` helper in the task controller checks ownership and membership before any data is returned.

### Activity Logging
Every task creation and update automatically creates an `Activity` document. This is done inside the same controller function (not a separate middleware) to keep the logic co-located and explicit.

### Consistent API Response Shape
All API responses follow a consistent envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```
This makes frontend error handling predictable: always check `response.data.success`.

### Token Expiry
JWTs are issued with a **7-day expiry**. The frontend stores them in `localStorage`. On expiry, the Axios interceptor catches the 401 response and redirects to `/login`.

### Password Security
Passwords are hashed with `bcryptjs` using a cost factor of **12**, which is strong enough for a production workload while remaining fast during development. The `passwordHash` field has `select: false` in the Mongoose schema, so it is never accidentally included in API responses.

---

## 8. Error Handling Strategy

| Layer | Approach |
|---|---|
| Input validation | Controllers validate required fields and return 400 with a descriptive message |
| Authentication | `auth.middleware.js` returns 401 for missing or invalid tokens |
| Not found | Controllers return 404 when a resource doesn't exist or the user lacks access |
| Server errors | A global error handler in `app.js` catches unhandled errors and returns 500 |
| Frontend | Axios catches errors; components display `err.response?.data?.message` to the user |

---

## 9. Environment Variables

### Backend (`BACKEND/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_strong_secret_here
```

### Frontend (`FRONTEND/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 10. Future Design Considerations

| Feature | Design Approach |
|---|---|
| Real-time updates | Add Socket.IO to the backend; emit events on task updates; subscribe on the frontend |
| Drag-and-drop board | Use `@dnd-kit/core` for accessible drag-and-drop task status changes |
| File attachments | Store files in AWS S3 or Cloudinary; save reference URLs in the Task document |
| Email notifications | Add a job queue (Bull + Redis); send emails via Nodemailer or SendGrid on task assignment |
| Role-based access | Extend the `members` array to store `{ userId, role }` objects instead of bare IDs |
