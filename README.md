# TaskFlow - Agile Project Management System

TaskFlow is a robust, full-stack Kanban and Agile project management application inspired by Jira. Built with a **Spring Boot** backend and a **React.js** frontend, it helps development teams organize sprints, track issues (Stories, Bugs, Tasks), and seamlessly collaborate in real-time.

## 🚀 Features

* **Role-Based Access Control (JWT)**: Secure stateless authentication with distinct privileges for `ADMIN` (create projects, manage all tickets) and `USER` (view boards, update status, add comments).
* **Interactive Kanban Board**: Drag-and-drop interface for moving tasks across columns (To Do, In Progress, In Review, Done).
* **Advanced Issue Tracking**: Supports custom Sprints, Ticket Types (Story, Bug, Task), Priorities, Reporters, and Assignees.
* **Concurrency Control (Optimistic Locking)**: Safe concurrent edits! If two users edit the same ticket or comment simultaneously, Hibernate `@Version` catches the conflict and prevents data loss.
* **Real-time Activity & Comments**: Threaded comment system on every ticket allowing users to discuss issues and track progress.
* **Asynchronous Email Notifications**: Uses `JavaMailSender` and `@Async` to instantly notify the admin via email when a team member changes a task's status, without blocking the API response.
* **Team Member Filtering**: Instantly filter the Kanban board to view the workload of specific team members.

## 💻 Tech Stack

### Backend
* **Java 17** & **Spring Boot 3**
* **Spring Security** (JWT Authentication)
* **Spring Data JPA / Hibernate**
* **MySQL** Database
* **JavaMailSender** (Async Email Notifications)
* **Maven**

### Frontend
* **React.js** (Vite)
* **React Bootstrap** & **CSS** (Responsive UI)
* **React Router** (SPA Navigation)
* **React Toastify** (Notifications)

## 🛠️ Local Setup & Installation

### Prerequisites
* Java 17+
* Node.js & npm (v18+)
* MySQL Server (running on port 3306)

### 1. Database Configuration
Create a new MySQL database named `taskflow_db`:
```sql
CREATE DATABASE taskflow_db;
```
Ensure your `src/main/resources/application.properties` has the correct MySQL credentials (default expects `root` / `root`) and SMTP email configurations.

### 2. Run the Backend
Navigate to the root directory and run the Spring Boot application using the Maven wrapper:
```bash
./mvnw spring-boot:run
```
*(The backend will run on `http://localhost:8080`)*

### 3. Build & Run the Frontend
The React application is integrated into the Spring Boot static resources for production, but for local development:
```bash
cd taskflow-ui
npm install
npm run dev
```

### 4. Admin Setup
On first startup, the application's `DataSeeder` will automatically create an admin account (check `application.properties` for the credentials, default is `admin@taskflow.com` / `admin123`).

## 📸 Screenshots
*(Add your screenshots here! E.g., `![Kanban Board](/docs/board.png)`)*

---
*Developed by [Your Name]*
