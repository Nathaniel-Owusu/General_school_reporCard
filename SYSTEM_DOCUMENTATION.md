# General School Report Card System - Comprehensive Documentation

Welcome to the official documentation for the **General School Report Card System**, a premium, multi-tenant school management, grading, and reporting platform designed by CorelTech.

---

## 📑 Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Core Modules & Features](#3-core-modules--features)
4. [Modern UI / Premium Aesthetics](#4-modern-ui--premium-aesthetics)
5. [Data Architecture](#5-data-architecture)
6. [Security & Authentication](#6-security--authentication)
7. [Deployment & Support](#7-deployment--support)

---

## 1. System Overview

The General School Report Card System is a web-based, multi-tenant application built to streamline operations for schools, ranging from administrative duties to grade processing and report card generation.

**Key Technical Stack:**

- **Frontend:** HTML5, Vanilla JavaScript, CSS3
- **Styling:** TailwindCSS, Custom Modern UI CSS (`modern-ui.css`), Glassmorphism concepts
- **Icons:** Ionicons
- **Charts:** Chart.js
- **Data Storage:** LocalStorage (Prototype/Dev), MySQL via PHP API (Production)

---

## 2. User Roles & Permissions

The platform supports a 4-tier hierarchical access system with strict role-based access control (RBAC).

### 🔷 Super Admin (`super_admin`)

- **Scope:** Multi-school (System-wide)
- **Dashboard:** `super-admin.html`
- **Capabilities:**
  - Create and manage schools (activate, deactivate, soft delete).
  - Auto-seed new schools with GES (Ghana Education Service) default classes and subjects.
  - Create and assign School Admin accounts.
  - Monitor system-wide statistics (Total students, teachers, active schools).

### 🔶 School Admin (`admin`)

- **Scope:** Single School
- **Dashboard:** `admin-dashboard.html`
- **Capabilities:**
  - Manage classes, subjects, and teacher assignments.
  - Oversee student enrollment and directory.
  - Approve and publish student results.
  - Manage system settings (Grading scales, term details, attendance defaults).
  - Generate bulk report cards.

### 🔸 Teacher (`teacher`)

- **Scope:** Assigned Classes
- **Dashboard:** `teacher-portal.html`
- **Capabilities:**
  - View assigned classes.
  - Input class (30%) and exam (70%) scores for students.
  - Review student lists for their assigned classes.

### 🔹 Student (`student`)

- **Scope:** Personal Records
- **Dashboard:** `student-report.html`
- **Capabilities:**
  - Log in using a unique Index Number (e.g., `ST_001`).
  - View visually polished, official report cards.
  - Print report cards.

---

## 3. Core Modules & Features

### 🏫 School & Curriculum Management

- **Classrooms:** Group students into structured classes (e.g., Basic 1, JHS 2).
- **Subjects:** Define curriculum subjects and selectively map them to specific classes.
- **Auto-Seeding:** Rapidly deploy new schools with pre-configured KG, Primary, and JHS subjects and classes.

### 🧑‍🎓 Student & Admissions Management

- **Directory:** Search, filter, and manage enrolled students.
- **Auto-Index:** Generate standard index numbers automatically.
- **Admissions Queue:** Review and process new student applications directly from the dashboard.

### 👨‍🏫 Faculty Management

- **Teacher Directory:** Add teachers and securely generate their access credentials.
- **Subject Mapping:** Assign teachers to specific subjects within designated classes to control gradebook access.

### 📊 Gradebook & Results

- **Seamless Grading:** Teachers can easily input continuous assessment (Class Score) and Exam scores.
- **Modern Class Manager:** Admins can view a specialized interface summarizing class performance, student rosters, and quick-print actions.
- **CSV Handling:** Import and export grades seamlessly for offline processing.
- **Results Review:** Admins must approve results before they are officially stamped and published.

### ⚙️ Premium Settings Panel

A dedicated system settings area allowing School Admins to deeply configure the platform:

- **General Info:** Set School Name, Motto, Contact Details, and upload the official Logo.
- **Grading System:** Fully customizable grading scales (e.g., 80-100% = A [Excellent], 70-79% = B [Very Good]).
- **Attendance:** Define total school days per term and default present days.
- **System Toggles:** Toggle teacher editing capabilities after submission and control if class positions (1st, 2nd) show on the reports.
- **Academic Year:** Manage the active Academic Year and Term.
- **Data Management:** Export and import complete school backups via JSON.

---

## 4. Modern UI / Premium Aesthetics

The system differentiates itself through exceptionally polished, SaaS-level design patterns.

- **Glassmorphism:** Elegant use of translucency, backdrops, and blur effects across overlays and modals.
- **Color Theory:** Curated gradients (e.g., Indigo/Purple, Emerald/Teal) replace generic flat colors to create a visually rich environment.
- **Micro-Interactions:** Buttons, cards, and rows feature smooth hover states (`hover:-translate-y-0.5`, `transition-all`), elevating the tactile feel.
- **Dynamic Feedback:** Integration of Shimmer loading skeletons during data fetches, and beautifully animated toast notifications (SweetAlert/Toastify style).
- **Report Cards:** Modernized, highly professional report cards using structured tables, premium typography (`Outfit` font), circular progress rings, and printable specific CSS (`@media print`).

---

## 5. Data Architecture

The application abstracts its database layer using `storage.js`, facilitating rapid prototyping via `localStorage` while maintaining readiness for a MySQL/PHP backend `db_handler.php`.

**Standard Schema Objects:**

- `schools` (ID, Name, Settings, Status)
- `users` (ID, Role, School_ID, Credentials)
- `students` (ID, Index_Number, Class_ID)
- `classes` (ID, Name, Level)
- `subjects` (ID, Name)
- `results` (ID, Student_ID, Subject_ID, Term, Class_Score, Exam_Score)

---

## 6. Security & Authentication

- **Session Handling:** `sessionStorage` tracks the active user. If missing or invalid, routes automatically redirect to `login.html`.
- **RBAC Validation:** Every sensitive page (`admin-dashboard.html`, `super-admin.html`) triggers `checkAuth()` to verify the logged-in role against the permitted roles. Unauthorized attempts are forcefully ejected.
- **Status Checks:** Admins and Students assigned to deactivated ("Blocked") schools are automatically denied entry.

_(Note: In the current prototype state, authentication relies heavily on client-side checks. For live deployments, transitioning to server-side JWT or Session Cookies is enforced by the architecture)._

---

## 7. Deployment & Support

**Deployment Preparation:**

1. Migrate `storage.js` to point to the live `api/db_handler.php`.
2. Secure the MySQL database with strict `.env` variables.
3. Obfuscate/Minify JS assets for production safety.

**Support Channels:**
Powered by Corel-Tech.
Please refer to `HOSTINGER_SETUP.md` for server configurations and `SECURITY_AUDIT.md` for pre-launch security checklists.
