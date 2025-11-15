# Task and Time Tracking App

A full-stack web application built with SvelteKit that allows users to manage their tasks, track time spent on them, and view daily productivity summaries. This project demonstrates secure authentication, a robust REST API, and a clean, responsive user interface.

## 🚀 Live Demo

:white_check_mark: **Link to the live application:** `https://ticktasksdemo.netlify.app/auth/login`

## 🔑 Test Credentials

For easier review, you can use these credentials:

-   **Email:** `jarvis@gmail.com`
-   **Password:** `securepassword123`

*Note: The database may be reset on the deployed service.*

## 🛠️ Tech Stack

-   **Frontend**: SvelteKit 2, Svelte 5, Tailwind CSS
-   **Backend**: Node.js (via SvelteKit Server Routes)
-   **Database**: SQLite with Prisma ORM
-   **Authentication**: Custom implementation using secure cookies and `bcryptjs` for password hashing.
-   **AI Integration**: OpenAI API for intelligent task enhancement (optional).

## 🏗️ Project Structure

A brief overview of the key directories and files in this project:


## Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource: "sqlite" -> "file:./dev.db"

✓ Existing database is empty, applying migration
✔ Created Migration 2024..._init (./migrations/2024..._init/migration.sql)

## How to Start It
Make sure your .env file is in your project root with the DATABASE_URL.
Open your terminal in your project's root directory.
Run the command:
bash

npx prisma migrate dev --name init