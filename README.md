# Tanzeem-e-Islami Official Web Platform

The official, production-ready Next.js web application for **Tanzeem-e-Islami (Tanzeem.org)**. This platform features a high-performance frontend for public visitors and a robust, custom-built CMS (Content Management System) for managing organizations, media, and digital resources.

## ✨ Technology Stack

This application is built with a modern, cutting-edge technology stack focused on performance, security, and developer experience:

### 🎯 Core Framework
- **⚡ Next.js 16** - The React framework for production, fully utilizing the App Router.
- **⚛️ React 19** - The latest React APIs and server components.
- **📘 TypeScript 5** - Type-safe JavaScript.
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development.

### 🗄️ Database & Backend
- **🐬 MySQL** - Primary relational database.
- **💧 Drizzle ORM** - High-performance, type-safe TypeScript ORM.
- **🔐 NextAuth.js** - Complete, secure authentication solution for the Admin CMS.
- **☁️ External FTP Media** - Custom chunked streaming to host large media assets (videos, PDFs, audio) externally.

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible UI components.
- **🎯 Lucide React** - Beautiful & consistent icon library.
- **🌈 Framer Motion & GSAP** - Production-ready motion libraries for interactive micro-animations.
- **📝 TipTap** - Advanced rich-text editor integrated into the CMS.

### 📋 Forms & Security
- **🎣 React Hook Form + Zod** - Performant forms with end-to-end schema validation.
- **🛡️ Google reCAPTCHA v3** - Advanced bot protection for public forms (Login, Contact, Joining).

---

## 📦 Key Dependencies & Libraries

If you are reconstructing this environment or need to know the explicit commands used to install the core libraries within this project, here they are categorized by their purpose:

### Core Framework & State
```bash
npm install next react react-dom zustand swr @tanstack/react-query
```

### Database & ORM
```bash
npm install drizzle-orm mysql2
npm install -D drizzle-kit
```

### Authentication & Security
```bash
npm install next-auth bcryptjs react-google-recaptcha-v3
npm install -D @types/bcryptjs
```

### UI, Styling & Icons
```bash
npm install lucide-react framer-motion gsap next-themes tailwind-merge clsx class-variance-authority
```

### Forms & Validation
```bash
npm install react-hook-form @hookform/resolvers zod
```

### Media, Uploads & Rich Text
```bash
npm install basic-ftp fluent-ffmpeg @tiptap/react @tiptap/starter-kit
```

---

## 🎯 Core Features

- **Custom Built CMS (`/sitemanager`)**: Fully-fledged administrative dashboard to manage Homepage content, Services, Campaigns, Magazines, Press Releases, Videos, Audios, Books, and dynamic Pages.
- **Dynamic Page Builder**: Create highly customizable pages using drag-and-drop dynamic blocks (Text, Images, PDF Viewers, Video Grids).
- **Advanced Media Library**: Upload massive files seamlessly. Bypasses standard serverless payload limits by utilizing chunked FTP streaming directly to the media server.
- **Native PDF & Media Viewers**: Standardized native browser rendering for PDFs and optimized audio/video players globally.
- **SEO Optimized**: Dynamic metadata generation, JSON-LD schemas, and fast server-side rendering for optimal search engine indexing.

---

## 🚀 Quick Start

Follow these instructions to run the project in your local development environment.

### 1. Prerequisites
- **Node.js** (v18.17+ or newer recommended)
- **MySQL** database (Local or Cloud)
- **Git**

### 2. Installation
Clone the repository and install dependencies using **npm**:

```bash
# Clone the repository
git clone https://github.com/your-org/tanzeem-next.git
cd tanzeem-next

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the project. Use the provided `.env.example` (or `.env.local`) as a reference. Ensure you have the following essential keys configured:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/tanzeem_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string"

# ReCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_recaptcha_site_key"
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key"

# External FTP Media Server
FTP_HOST="ftp.example.com"
FTP_USER="your_ftp_user"
FTP_PASSWORD="your_ftp_password"
NEXT_PUBLIC_MEDIA_URL="https://media.tanzeem.org"
```

### 4. Database Setup
Push the Drizzle schema to your connected MySQL database to generate the tables, and optionally seed the initial admin account.

```bash
# Push schema to local DB
npm run db:push:local

# Seed initial admin and settings (Optional)
npm run seed:admin
npm run seed:settings
```

### 5. Start Development Server
Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public site. 
Navigate to [http://localhost:3000/sitemanager/login](http://localhost:3000/sitemanager/login) to access the administrative dashboard.

---

## 📁 Project Architecture

```
src/
├── app/                 # Next.js App Router (Public Pages, API Routes, /sitemanager)
├── components/          # Reusable React components
│   ├── admin/           # CMS administrative components and complex layout editors
│   ├── home/            # Public Homepage specific sections
│   ├── shared/          # Global layout components (Headers, Footers, Media Grids)
│   └── ui/              # shadcn/ui base elements
├── db/                  # Drizzle ORM schemas and DB connection setup
├── lib/                 # Utility functions, SEO builders, API validation schemas
└── hooks/               # Custom React hooks (e.g. chunked FTP uploaders)
```

## 🛠️ Build & Deployment

To build the application for production:

```bash
# Generate the optimized production build
npm run build

# Start the production server
npm start
```

For environments like **Vercel**, ensure all environment variables are securely added to the project settings, and that the MySQL database is publicly accessible (or VPC peered) to the deployment edge functions.

---

Built with ❤️ for Tanzeem-e-Islami.
