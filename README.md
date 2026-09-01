<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SafeMail Check

SafeMail Check is an email safety dashboard for reviewing suspicious messages, checking sender trust, and learning basic digital safety habits.

## What is included

- React + Vite frontend for email analysis
- Java Spring Boot backend for authentication and user APIs
- Awareness & precautions section for simple user education
- Human-friendly labels instead of heavy SOC jargon

## Run the frontend

Prerequisites: Node.js

1. Install dependencies:
   `npm install`
2. Start the frontend:
   `npm run dev`

## Run the Java backend

Prerequisites: Java 17 and Maven

1. Go to the backend folder:
   `cd backend-java`
2. Start the server:
   `mvn spring-boot:run`
3. The API will run on:
   `http://localhost:8081`

## Main API endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/profile`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
