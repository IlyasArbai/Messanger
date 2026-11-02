# Rituals Clone

A full-stack e-commerce project inspired by **Rituals**, built with Vue 3, Vite, and Express.js. The project recreates the brand's shopping experience with a clean, minimalist interface and a focus on personal care and home fragrance products.

## Tech Stack

**Frontend**

- Vue 3 — Composition API and `<script setup>`
- Vite — Development server and build tool
- Tailwind CSS — Styling and responsive layouts

**Backend**

- Node.js
- Express.js — REST API

## Features

- Product catalog and category filtering
- Responsive product grid
- Reusable Vue components
- Minimalist, Rituals-inspired design
- Full-stack architecture with Express.js

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
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

### 3. Run the application

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

Open the local URL provided by Vite in your browser.

## Project Structure

```text
project/
├── client/          # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── views/
│   │   └── ...
│   └── package.json
│
└── server/          # Express.js backend
    ├── routes/
    ├── controllers/
    ├── package.json
    └── ...
```

_Note: Adjust the folder names and commands to match the actual project structure and scripts._

## Development

The frontend uses Vue 3 Single-File Components and Vite's hot module replacement for a fast development workflow. The Express backend provides the foundation for API endpoints and server-side functionality.

## Disclaimer

This is an independent educational project inspired by Rituals. It is not affiliated with or endorsed by Rituals Cosmetics.
