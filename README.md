# Indian Institute of Information Technology Bhagalpur
## Curriculum & Syllabus Portal

An enterprise-grade academic platform built for **IIIT Bhagalpur** featuring a public curriculum portal for students and a secure, protected administrative management portal for faculty.

---

## 🏛️ Project Overview

The **Curriculum & Syllabus Portal** provides a single source of truth for all academic courses, syllabi, module breakdowns, reference literature, and official curriculum PDF documents across all academic programmes (**BTech**, **MTech**, and **PhD**).

### Primary System Modules

1. **Public Student Portal**
   - **Programme-First Browsing**: Students select their academic programme (`BTech`, `MTech`, `PhD`) to unlock filtered views.
   - **Multi-Parametric Filtering**: Reactive filters for Batch, Branch (`CSE`, `MnC`, `ECE`, `MAE`), and Semester (individual semesters or "All Semesters"). *No search bar by design specification.*
   - **Structured Course Information**: Displays Course Code, Course Name, Core/Elective indicators (electives marked with `*`), L/T/P/C breakdown, Course Objectives, sequential Module-Wise Syllabus tables, and Reference Books.
   - **Document Downloads**:
     - Single Course PDF download (original authentic PDF uploaded by faculty).
     - Filtered "Download All Syllabi" ZIP archive generator with status reporting for unavailable documents.

2. **Protected Faculty & Admin Portal**
   - **Single Admin Authentication**: Secure, session-based faculty login (no public registration or self-service password reset).
   - **Curriculum Management Dashboard**: Course listing mirroring the student view with straightforward course authoring, real-time editing, and deletion workflows.
   - **Independent Course Offering Architecture**: Course codes can exist autonomously across different batches, branches, or semesters without cross-contamination.
   - **Strict Module Syllabus Parser**: Enforces the rigid standard format:
     ```text
     Module 1: Introduction to Programming, Variables, Data Types (6)
     Module 2: Control Statements, Loops, Functions (8)
     Module 3: Arrays, Strings, Pointers (10)
     ```
   - **Outdated-PDF Warning System**: Automatically alerts faculty if syllabus text is modified without updating the official PDF document.
   - **Excel Bulk Import Engine**: Pre-import validation preview, duplicate detection, row-by-row error reporting, and selective import/update capabilities.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript) | Component-driven user interface |
| **Styling** | Tailwind CSS | Institutional theme styling (Navy / White / Gold) |
| **Routing** | React Router v6 | Client-side routing and protected route guards |
| **Backend** | Node.js + Express | Robust RESTful API architecture |
| **Database** | MySQL | Relational data persistence |
| **ORM** | Prisma ORM | Migration-backed schema modeling and query execution |
| **Auth** | Express Session + Bcrypt | Server-side secure sessions with HttpOnly cookies |
| **File Storage**| Local Filesystem Abstraction | Secure PDF document and template storage |

---

## 📁 Repository Directory Structure

```text
Academic Curriculum Portal/
├── .gitignore                     # Repository ignore rules
├── README.md                      # Project documentation & architectural overview
├── frontend/                      # Client-side React application
│   ├── .env                       # Frontend environment template
│   ├── public/                    # Static assets
│   │   └── assets/
│   │       ├── icons/             # Institutional SVG icons and badges
│   │       └── images/            # IIIT Bhagalpur crests, campus banners, Azadi logos
│   └── src/
│       ├── assets/                # Bundled graphics and stylesheets
│       ├── components/
│       │   ├── common/            # Header, Footer, Banner, Breadcrumb, Modals
│       │   ├── student/           # CurriculumTable, FilterBar, ModuleTable
│       │   └── faculty/           # CourseTable, SubjectForm, ModuleEditor, ExcelImporter
│       ├── context/               # Auth and Application State Providers
│       ├── hooks/                 # Custom React hooks (useAuth, useFilters, useCourse)
│       ├── pages/
│       │   ├── student/           # CurriculumPage, CourseDetailsPage
│       │   └── faculty/           # LoginPage, ManageCoursesPage, AddSubjectPage, EditSubjectPage
│       ├── services/              # API Client Service & HTTP abstractions
│       └── utils/                 # Client-side validators and formatters
└── backend/                       # Server-side Node.js & Express API
    ├── .env                       # Backend environment template
    ├── prisma/                    # Prisma ORM schema definitions and migrations
    ├── uploads/                   # Local file storage (isolated behind storage service)
    │   ├── syllabi/               # Stored course PDF documents
    │   ├── templates/             # Excel import templates (.xlsx)
    │   └── temp/                  # Ephemeral ZIP packages and upload buffers
    └── src/
        ├── config/                # Database, session, and security configurations
        ├── controllers/           # Route controller handlers
        ├── middleware/            # Auth guards, file upload filters, rate limiters
        ├── routes/                # Public, admin, and authentication route definitions
        ├── services/              # Business logic (Course, PDF, Excel, ZIP services)
        └── utils/                 # Strict module parser, file validators, error handling
```

---

## 🚀 Architecture Highlights

- **Modular Monolith**: Cleanly decoupled React client and Express API.
- **Robust Relational Data**: Migration-backed schema utilizing Prisma ORM on MySQL.
- **Fail-Safe Ingestion**: Atomic multi-row Excel import engine with pre-validation and rollback.
- **Zero-Trust Document Management**: File magic-byte checks and isolated storage paths.

---

## 🔒 Security & Data Integrity Highlights

- **Server-Side Authorization**: Every administrative endpoint is validated using server-side session authentication with `HttpOnly` and `SameSite` flags.
- **Magic Byte File Validation**: Uploaded PDF files are inspected for real PDF magic bytes (`%PDF-`) and validated for size limits to prevent malicious uploads.
- **Transactional Bulk Imports**: Multi-row Excel course imports execute within atomic database transactions with pre-flight dry-run validations.
- **Path Traversal Protection**: File storage utilizes generated UUID keys and sanitized filenames, preventing directory traversal vulnerabilities.

---

## 📄 License & Attribution

Internal Academic Project for **Indian Institute of Information Technology Bhagalpur**.  
All rights reserved © 2026.
