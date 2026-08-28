# History.job

**History.job** is a full-stack web application that helps job seekers organize their entire job search in one place. Applications are grouped by **profiles**, where you can track opportunities across different countries.

Its standout feature is **AI-powered job offer scanning**: analyze a job posting (in any language) and a large language model automatically extracts the key details — company name, job title, location, salary, contract type (on-site / hybrid / remote) and a structured summary of responsibilities and required skills.

A companion **Chrome extension (H.J Clipper)** lets you capture job postings directly from your browser and send them to your account in one click.

## Features

- **Country profiles** — organize applications by country, each with a real-time local clock.
- **Application tracking** — manage candidacies by status (to apply, applied, interview, etc.) with a full activity timeline.
- **AI job offer analysis** — automatic extraction of structured data from raw job posting text, in any language.
- **Document management** — upload and store CVs and cover letters per application.
- **Dashboard & analytics** — visualize application counts and progress with charts.
- **Chrome extension** — clip job offers straight from any web page.

## Tech Stack

### Frontend
- **React 19** with **Vite** as the build tool
- **Tailwind CSS** for styling
- **Zustand** for state management
- **TanStack React Query** for server-state and data fetching
- **React Router** for routing
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **Zod** for schema validation

### Backend
- **Node.js** with **Express 5**
- **MongoDB** with **Mongoose** ODM
- **Groq SDK (Llama 3)** and **Google Generative AI** for job offer analysis
- **JWT** (jsonwebtoken) and **bcrypt** for authentication
- **Cloudinary** and **Multer** for file uploads and storage
- **Zod** for request validation

### Browser Extension
- **Chrome Extension (Manifest V3)** — service worker, content scripts and popup UI in vanilla JavaScript

## Project Structure

```
backend/     REST API (Express, MongoDB, AI integration)
frontend/    React single-page application (Vite, Tailwind)
extension/   Chrome extension (H.J Clipper)
```

## Getting Started

### Prerequisites
- Node.js (18+)
- A MongoDB database
- API keys for Groq and Cloudinary

### Backend
```bash
cd backend
npm install
npm run dev
```
Create a `.env` file with the required variables (MongoDB URI, JWT secret, Groq API key, Cloudinary credentials).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder.
3. Pin the **H.J Clipper** icon and log in with your History.job credentials.
