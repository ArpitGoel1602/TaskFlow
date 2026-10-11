# TaskFlow

A full-stack project and task management application that helps teams organize work, track progress, and collaborate efficiently. TaskFlow provides a clean Kanban-style board experience with user authentication, project management, task assignments, and activity tracking.

---

## Features

- **User Authentication** – Register and log in securely with JWT-based authentication and bcrypt password hashing
- **Project Management** – Create, view, and manage multiple projects
- **Task Board** – Kanban-style board with four status lanes: `Todo`, `In Progress`, `Review`, and `Completed`
- **Task Management** – Create tasks with title, description, priority (low / medium / high), due date, and assignee
- **Task Details** – View full task details including comments and activity history
- **Comments** – Add comments to tasks for team collaboration
- **Dashboard** – Overview of projects, tasks, and recent activity
- **Protected Routes** – Authenticated-only access to app pages
- **Responsive Layout** – Sidebar + Navbar shell with a clean, consistent UI

---

## Technologies Used

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client for API calls |
| Lucide React | Icon library |
| Vite | Build tool and dev server |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | Web framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JSON Web Token (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| CORS | Cross-origin request handling |
| Nodemon | Development auto-restart |

---

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/TaskFlow.git
cd TaskFlow
```

### 2. Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file inside the `BACKEND` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_secret_key
```

### 3. Frontend Setup

```bash
cd ../FRONTEND
npm install
```

Create a `.env` file inside the `FRONTEND` folder:

```env
VITE_API_URL=http://localhost:5000
```

---

## How to Run the Application

### Run the Backend

```bash
cd BACKEND
npm run dev
```

The backend server starts on **http://localhost:5000**

### Run the Frontend

```bash
cd FRONTEND
npm run dev
```

The frontend dev server starts on **http://localhost:5173**

Open **http://localhost:5173** in your browser. Register a new account or log in to get started.

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/:id` | Get project details |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/comments/:taskId` | Get comments for a task |
| POST | `/api/comments` | Add a comment |
| GET | `/api/dashboard` | Get dashboard summary |

---

## AI Tool Used

**Kiro** – This project was developed with the assistance of **Kiro**, an AI-powered development environment built on VS Code.

---

## AI Development Experience

Kiro played a central role throughout the development of TaskFlow, accelerating both the design and implementation phases. Below are five specific areas where Kiro was actively used:

### 1. Component Development
Kiro helped scaffold and develop React components such as `TaskBoard.jsx`, `TaskCard.jsx`, `Sidebar.jsx`, and `Navbar.jsx`. It generated the initial JSX structure, applied consistent styling patterns, and wired up props — cutting the time spent on boilerplate significantly.

### 2. REST API Creation
Kiro generated the Express route handlers and controllers for all major resources (auth, projects, tasks, comments, dashboard). It followed a consistent controller pattern with proper error handling, HTTP status codes, and separation of concerns from the start.

### 3. Database Integration
Kiro designed the Mongoose schemas for `User`, `Project`, `Task`, `Comment`, and `Activity` models, including field validations, enums (e.g. task status and priority), default values, and `ref` relationships between collections. It also helped wire up the MongoDB connection configuration in `config/db.js`.

### 4. Authentication & Middleware
Kiro implemented the full JWT authentication flow — from password hashing with `bcryptjs` on registration, to token signing on login, to a reusable `auth.middleware.js` that validates tokens on protected routes. It also set up the global error middleware in `app.js`.

### 5. Debugging & Code Review
When issues arose (such as project-not-found errors and invalid task status transitions), Kiro performed investigations by reading route definitions, controller logic, and model schemas together, identified the root causes, and produced targeted fixes — acting like a pair programmer that could trace a bug across the full stack in one pass.
