# Task Flow

A modern, AI-powered Project Management Application built with **React**, **Vite**, **TypeScript**, and **Shadcn UI**.

## 🚀 Features

### Core Management
- **Authentication**: Secure JWT-based login and registration.
- **Projects**: Create, track, and manage projects with member roles.
- **Task Board**: Kanban-style task management with drag-and-drop.
- **Admin Dashboard**: Comprehensive overview for administrators (User Management, Task Monitoring).

### 🤖 AI Integration (Powered by Google Gemini)
- **Smart Task Creation**: Create tasks using natural language prompts.
- **AI Assistant**: Context-aware chat assistant to help with project queries.
- **Goal Decomposition**: Automatically break down high-level goals into actionable subtasks.
- **Intelligent Insights**: Productivity analytics and task summarization.

### UI/UX
- **Responsive Design**: Mobile-friendly layout with sidebar navigation.
- **Theme Support**: Light/Dark mode with system preference detection.
- **Dynamic Avatars**: Initials-based or custom avatars.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Lucide React
- **Backend**: Node.js, Express, MongoDB
- **AI**: Google Generative AI (Gemini)
- **State Management**: React Context
- **Real-time**: Socket.io

## 📂 Project Structure

Verified Refactored Structure:
```
task-flow/
├── public/              # Static assets
├── server/              # Backend Application
│   ├── src/             # Source code
│   │   ├── config/      # DB & Env configuration
│   │   ├── controllers/ # Route Logic
│   │   ├── models/      # Mongoose Models
│   │   ├── routes/      # API Routes
│   │   └── server.js    # Entry point
│   └── package.json
└── src/                 # Frontend Application
    ├── components/      # Reusable components
    ├── layouts/         # Layout wrappers (Sidebar, TopNav)
    ├── pages/           # Application pages (routed)
    ├── services/        # API & AI services
    └── context/         # Global state (Auth, Data)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/task-flow.git
    cd task-flow
    ```

2.  **Install Dependencies**:
    ```bash
    # Frontend
    npm install

    # Backend
    cd server
    npm install
    ```

3.  **Environment Setup**:
    - Create `server/.env` with:
      ```env
      PORT=5000
      MONGO_URI=mongodb://localhost:27017/taskflow
      JWT_SECRET=your_jwt_secret
      GEMINI_API_KEY=your_gemini_api_key
      ```

4.  **Run the Application**:
    ```bash
    # Terminal 1: Backend
    cd server
    npm run dev

    # Terminal 2: Frontend
    cd ..
    npm run dev
    ```

5.  **Access**: Open `http://localhost:8080` (or the port shown in your terminal).

## 🔒 Security Note
This project uses HTTP-only cookies and JWTs for authentication. Ensure your `JWT_SECRET` is strong and kept private in production.
