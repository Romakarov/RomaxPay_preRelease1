# CryptoPay Mini - Telegram Mini App

## Overview

CryptoPay Mini is a production-ready Telegram Mini App designed for cryptocurrency payment wallet management. It allows users to manage their USDT (TRC20) balance, view real-time exchange rates to Russian Rubles (RUB), create payment requests, and track transaction history. The application operates within Telegram's WebView environment, featuring a bold Neo-Brutalist design aesthetic. The project aims to provide a secure and efficient platform for crypto transactions within Telegram, leveraging a full-stack architecture with PostgreSQL, Express.js, and React.

## Recent Changes

**November 15, 2025 (UI Improvements & Deposit History)**:
- **Dashboard Enhancement**: Made balance cards more prominent with bold fonts (font-black), larger text (7xl), and Neo-Brutalist styling (border-4, shadow-brutal). Increased button heights to h-20 with larger icons and text.
- **Frozen Balance Redesign**: Created separate yellow card for frozen balance when > 0, visually distinct with border-4 border-yellow-500 and text-3xl font-black display.
- **Exchange Rate Card**: Enhanced with larger text (text-xl font-bold) and brutal shadow styling.
- **Text Removal**: Removed "Курс фиксируется при создании заявки" from main dashboard for cleaner UI.
- **History Integration**: Added deposit transactions to user history page, displaying alongside payment requests with distinct "Пополнение" label and green "+X USDT" formatting.
- **Transaction Types**: Extended Transaction interface to support both 'payment' and 'deposit' types with appropriate status handling (pending, confirmed).
- **API Integration**: Implemented getUserDeposits API call and combined deposits with payment requests in chronological order.

**November 15, 2025 (Replit Environment Setup)**:
- **Database Driver Migration**: Switched from `@neondatabase/serverless` to `drizzle-orm/node-postgres` with `pg` driver to support Replit's internal PostgreSQL database. This resolved compatibility issues with the local database instance.
- **Vite Configuration**: Added `host: "0.0.0.0"` and `allowedHosts: true` to vite.config.ts to enable proper proxy support for Replit's iframe-based preview system.
- **Workflow Setup**: Configured dev-server workflow to run on port 5000 with webview output for frontend preview.
- **Deployment Configuration**: Set up VM deployment target with build and production start commands.
- **Database Schema**: Successfully pushed database schema with tables for users, payment_requests, notifications, deposits, and operators.

**November 15, 2025 (PM - Latest)**:
- **Dashboard Compact Layout**: Removed excessive whitespace between buttons and bottom navigation menu (pb-20 → pb-6). Fixed "Заморожено" alignment and sizing. Optimized all cards and buttons for compact, balanced appearance without bulk.
- **Instructions Page Major Redesign**: Complete overhaul to make section 15-20% more compact and visually lighter. Removed all commission/pricing text. Restructured content: (1) Что можно оплачивать, (2) Что нельзя оплачивать, (3) Если есть вопросы, (4) Как мы считаем курс (moved to bottom). Updated exchange rate explanation to reference official ЦБ РФ rate via Google. Reduced padding (p-6→p-4), icons (w-16→w-12), headings (text-2xl→text-xl), and spacing throughout for modern, clean appearance.
- **Typography Refinement**: Added leading-snug and leading-tight across instruction blocks for better density. Simplified bullet-point lists for clarity.

**November 15, 2025 (PM - Earlier)**:
- **Main UI Redesign**: Removed exchange rate explanation text from main screen, kept only rate display. Reduced excessive spacing between blocks for better visual density.
- **Dashboard Layout Updates**: Changed "Рубли" to "Эквивалент в ₽" for clarity. Integrated ₽ symbol directly into the amount display. Made buttons 40% taller with larger fonts and icons for better accessibility.
- **Navigation State Preservation**: Confirmed payment draft state is preserved when switching between tabs during payment creation flow.

**November 15, 2025 (AM)**:
- **Admin Panel Enhancements**: Added optional admin comment field to payment request processing workflow, allowing operators to add notes or rejection reasons. Comments are displayed in both in-app and Telegram notifications.
- **Payment Amount Modification**: Admins can now adjust payment amounts during processing. The system automatically validates user balance, recalculates USDT using the frozen exchange rate, and manages balance freezing/unfreezing. Shows "insufficient balance" error if needed with option to cancel.
- **Attachment Viewing**: Receipt attachments now display directly in the admin panel browser (images render inline, PDFs open in browser viewer) instead of showing encoded text.
- **Download Functionality**: Added download buttons for all attachments and receipts in admin panel. Clients can now download payment receipts directly from their transaction history with a single click.
- **UI Updates**: Renamed "Решение" field to "Статус" throughout admin interface for clarity.
- **Rate Limiter Fix**: Configured trust proxy for Replit environment to resolve admin panel login errors.
- **Balance Logic Correction**: Fixed critical double-balance-update bug ensuring amount adjustments and status processing apply balance changes only once.
- **Admin Authentication**: Unified password verification across all admin endpoints with fallback support for development.
- **Exchange Rate Precision Fix**: Corrected floating-point precision issue by rounding exchange rate to 2 decimal places before sending to client, ensuring displayed rate matches the rate used for calculations (e.g., 1M USDT × 80.41 now correctly equals 80,410,000 RUB instead of 80,407,223 RUB).

## User Preferences

Preferred communication style: Simple, everyday language.

## Replit Environment Configuration

### Development Setup
- **Port Configuration**: Application runs on port 5000 (both frontend and backend on same server)
- **Host Binding**: Server binds to `0.0.0.0` to accept connections from Replit's proxy
- **Vite Dev Server**: Configured with `allowedHosts: true` to bypass host header verification for Replit's iframe preview
- **Database**: Uses Replit's internal PostgreSQL with `pg` driver via `drizzle-orm/node-postgres`
- **Environment Variables**: 
  - `DATABASE_URL`: Auto-provisioned by Replit PostgreSQL
  - `BOT_TOKEN`: Telegram Bot API token (set in Replit Secrets)
  - `ADMIN_PASSWORD`: Admin panel password (optional, defaults to 'admin123' in development)

### Deployment Configuration
- **Target**: VM deployment (stateful, always-on for Telegram bot and WebSocket support)
- **Build Command**: `npm run build` (compiles frontend with Vite, bundles backend with ESBuild)
- **Start Command**: `npm start` (runs production server from dist/)
- **Port**: 5000 (only port exposed by Replit)

### Database Migrations
- Use `npm run db:push` to sync schema changes to the database
- Tables: users, payment_requests, notifications, deposits, operators

## System Architecture

### Frontend Architecture

**Framework & Build Tools**: React 18+ with TypeScript, Vite for fast development. Navigation is handled via component state management.

**UI Component System & Design**: Utilizes shadcn/ui (New York variant) built on Radix UI, styled with Tailwind CSS. The design adheres to a Neo-Brutalist aesthetic characterized by thick black borders (3-4px), harsh drop shadows, vibrant solid colors (cyan, yellow, magenta), zero border-radius, high contrast typography (Inter font family), and asymmetrical layouts.

**State Management**: React Query for server state management and caching, local component state for UI. No global state management library is used; state is managed at the `App` component level.

**Application Structure**: Single-page application with component-based screen switching across main screens like Welcome, Dashboard, TopUp, Pay, History, Support, and Settings. All text content is in Russian.

**Telegram Integration**: Integrates with Telegram WebApp SDK for features like `ready()`, `expand()`, theme management, and secure user authentication via `initData` validation. It supports Telegram's viewport, theme colors, and bottom bar customization, with a fallback to a demo mode outside the Telegram environment.

### Backend Architecture

**Server Framework**: Express.js server with TypeScript, integrating custom Vite middleware for development and production-ready middleware like Helmet, CORS, and `express-rate-limit`. Includes Telegram bot integration via `node-telegram-bot-api`.

**Data Storage**: PostgreSQL database with Drizzle ORM for type-safe queries. A database service layer provides full CRUD operations for users, payment requests, and notifications, using high-precision numeric types for financial data.

**API Design**: RESTful API structure with a `/api` prefix, using JSON for requests/responses. Endpoints support user authentication, profile and balance retrieval, payment request creation and management, notification access, and real-time exchange rate fetching. Includes a webhook handler for Telegram bot events.

### Data Storage Solutions

**Database Schema**: The PostgreSQL database schema defines `users`, `payment_requests`, and `notifications` tables.
- **Users**: Stores UUID, Telegram ID, username, available and frozen USDT balances (numeric 18,8), and registration timestamp.
- **Payment Requests**: Stores UUID, user ID, amount in RUB (numeric 18,2) and USDT (numeric 18,8), exchange rate at the time of request, urgency, description, comment, admin_comment, receipt attachment, and status (submitted, processing, paid, rejected, cancelled).
- **Notifications**: Stores UUID, user ID, type, title, message content, optional payment request ID, read status, and creation timestamp. High-precision numeric types are used to prevent financial calculation errors.

### Admin Panel

**Authentication**: Password-based admin authentication using `ADMIN_PASSWORD` environment variable (set in Replit Secrets). Fallback value for development: 'admin123'.

**Features**:
- View and process pending payment requests
- Modify payment amounts during processing with automatic balance validation
- Add optional admin comments (displayed in notifications)
- View receipt attachments inline (images render, PDFs open in browser)
- Approve deposits (TRC20 USDT)
- Unified authentication across all admin endpoints

### Authentication and Authorization

**Current Implementation**: Secure authentication via Telegram WebApp `initData` validation, identifying users by Telegram ID. New users are automatically created on first authentication. A demo mode is available outside Telegram.

## External Dependencies

**Core Dependencies**:
- `@tanstack/react-query`: Server state management and caching.
- `React Hook Form` with `Zod`: Form validation.
- `date-fns`: Date manipulation.

**UI Component Libraries**:
- `@radix-ui/*`: Accessible UI primitives.
- `lucide-react`: Icon system.
- `class-variance-authority`, `tailwind-merge`, `clsx`: Styling utilities.
- `cmdk`: Command menu component.
- `embla-carousel-react`: Carousel functionality.

**Database & ORM**:
- `Drizzle ORM`: Type-safe SQL query builder with `drizzle-orm/node-postgres` adapter.
- `pg` (node-postgres): Standard PostgreSQL driver for Node.js, compatible with Replit's internal PostgreSQL.
- `connect-pg-simple`: PostgreSQL session store for Express.

**Build & Development Tools**:
- `Vite`: Frontend build tool.
- `TypeScript`: Full-stack type safety.
- `ESBuild`: Server-side bundling.

**External Services & Integrations**:
- `Telegram WebApp SDK`: Integrated via CDN.
- `Telegram Bot API` via `node-telegram-bot-api`: For bot interactions and webhooks.
- `ExchangeRate-API` (`open.er-api.com`): Provides real-time USD/RUB exchange rates, updated every 30 minutes, with a 0.5% market adjustment, caching, and fallback mechanisms.

**Styling & Theming**:
- `Tailwind CSS` with `PostCSS`: For utility-first styling and custom theme configuration, including light/dark modes.
- `Google Fonts`: Inter font family.