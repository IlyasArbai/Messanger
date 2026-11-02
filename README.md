# Messanger – Real-Time Chat Application

A full-stack real-time messaging application built with **React, Express.js, Socket.IO, PostgreSQL, and Redis**. The platform allows users to connect, manage conversations, send and receive messages in real time, and handle chat requests through a responsive and intuitive interface.

## Tech Stack

**Frontend**

- React — Component-based frontend architecture
- Tailwind CSS — Styling and responsive layouts

**Backend**

- Node.js — JavaScript runtime
- Express.js — REST API and server-side logic
- Socket.IO — Real-time, bidirectional communication
- PostgreSQL — Relational database for persistent data storage
- Redis — Authentication session storage and management

**DevOps**

- Docker — Containerization and deployment

## Features

- User registration and authentication
- Authentication session management with Redis
- Real-time messaging powered by Socket.IO
- Conversation management
- Chat requests management
- Dynamic message exchange without page refreshes
- Persistent data storage with PostgreSQL
- Responsive user interface
- Full-stack architecture with React and Express.js

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/IlyasArbai/Messanger.git
cd Messanger
```

### 2. Install dependencies

Install the frontend and backend dependencies separately:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Configure environment variables

Create the required `.env` files and configure the necessary environment variables, including:

- PostgreSQL connection details
- Redis connection URL
- Authentication secrets
- Server configuration

### 4. Run the application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Open the local URL provided by the frontend development server in your browser.

## Project Structure

```text
Messanger/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
│
├── server/              # Express.js backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── sockets/          # Socket.IO configuration
│   ├── ...
│   └── package.json
│
└── ...
```

_Note: Adjust folder names and commands to match the actual project structure and npm scripts._

## Development

The frontend uses React components to deliver a modular and responsive user interface. The Express.js backend handles API requests, authentication, and application logic.

Socket.IO provides real-time, bidirectional communication between connected users, while PostgreSQL handles persistent application data. Redis is used to store and manage authentication sessions, enabling efficient session retrieval and management.

Docker supports containerized development and deployment.

## Live Demo

[https://messanger.algorithmegenius.tech/](https://messanger.algorithmegenius.tech/)

## Source Code

[GitHub Repository](https://github.com/IlyasArbai/Messanger.git)

## Disclaimer

Messanger is an independent messaging application developed as a full-stack software project.
