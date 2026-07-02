# Company OS — Software Architecture Document

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-07-02

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Database Design](#3-database-design)
4. [API Design](#4-api-design)
5. [Authentication Flow](#5-authentication-flow)
6. [User Permissions](#6-user-permissions)
7. [Module Relationships](#7-module-relationships)
8. [Development Roadmap](#8-development-roadmap)
9. [Risks](#9-risks)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. System Architecture

### 1.1 High-Level Overview

Company OS follows a **three-tier architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│  React SPA (TypeScript) → shadcn/ui → TanStack Query │
│  Vite Dev Server (Dev)  →  Nginx (Prod)              │
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS / REST + JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  FastAPI (Python) → Pydantic Validation              │
│  JWT Auth Middleware → RBAC Decorators               │
│  Rate Limiting → Audit Logging                       │
└──────────────────────┬──────────────────────────────┘
                       │  SQLAlchemy ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│                 Data Layer                           │
│  PostgreSQL (Primary DB)                             │
│  Local Filesystem (Uploads, abstraction for S3)      │
│  Redis (Cache, rate limiting, task queue)            │
└─────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

| Principle | Application |
|---|---|
| **Clean Architecture** | Domain logic is isolated from frameworks. Use cases depend on abstractions, not infrastructure. |
| **SOLID** | Single-responsibility services, open-for-extension controllers, Liskov-substitutable repository backends, interface-segregated gateways, dependency-inverted providers. |
| **Repository Pattern** | Database access is abstracted behind repository interfaces. Swapping PostgreSQL for another engine requires changing only the repository implementation. |
| **Service Layer** | Business logic lives in service classes. Controllers (FastAPI route handlers) are thin — they parse input, call a service, return output. |
| **Dependency Injection** | FastAPI's `Depends()` provides DI for auth, DB sessions, repositories, and services. |
| **Provider Pattern** | External integrations (AI, storage, email) use pluggable providers behind a common interface. |

### 1.3 Technology Decisions

| Component | Choice | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Industry standard, rich ecosystem, strong typing. |
| **Build Tool** | Vite | Fast HMR, optimal production builds, native TS support. |
| **UI Library** | shadcn/ui + Tailwind CSS | Copy-pasteable components, full control, no bloated dependency. |
| **Server State** | TanStack Query v5 | Automatic caching, refetching, optimistic updates. |
| **Routing** | React Router v6 | Nested layouts, loaders, actions. |
| **Backend Framework** | FastAPI | Async-first, automatic OpenAPI, Pydantic validation, fast. |
| **ORM** | SQLAlchemy 2.0 | Mature, well-typed, async support, Alembic migrations. |
| **Migrations** | Alembic | Declarative, auto-generation, reversible. |
| **Validation** | Pydantic v2 | Fast, integrated with FastAPI, strict mode. |
| **Auth** | python-jose + passlib | JWT creation/verification, bcrypt hashing. |
| **DB** | PostgreSQL 16 | JSONB for flexible fields, full-text search, robust. |
| **Cache** | Redis | Session store, rate limiting, task queue backend. |
| **Storage** | Local FS → S3 abstraction | Start simple; swap via adapter. |
| **Testing** | pytest, vitest, Playwright | Coverage at unit, integration, and e2e levels. |

---

## 2. Folder Structure

```
company-os/
├── frontend/                          # React SPA
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── main.tsx                   # App entry
│   │   ├── App.tsx                    # Root component + router
│   │   ├── routes.tsx                 # Route definitions (lazy-loaded)
│   │   ├── global.css                 # Tailwind directives + CSS vars
│   │   ├── vite-env.d.ts
│   │   │
│   │   ├── api/                       # API client layer
│   │   │   ├── client.ts             # Axios instance, interceptors, base URL
│   │   │   ├── auth.ts               # login, logout, refresh, me
│   │   │   ├── properties.ts
│   │   │   ├── units.ts
│   │   │   ├── tenants.ts
│   │   │   ├── leases.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── work-orders.ts
│   │   │   ├── employees.ts
│   │   │   ├── inventory.ts
│   │   │   ├── equipment.ts
│   │   │   ├── vendors.ts
│   │   │   ├── documents.ts
│   │   │   ├── messaging.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reports.ts
│   │   │   ├── analytics.ts
│   │   │   ├── ai.ts
│   │   │   ├── admin.ts
│   │   │   ├── audit-log.ts
│   │   │   └── settings.ts
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useKeyboardShortcut.ts
│   │   │
│   │   ├── lib/                       # Utilities and helpers
│   │   │   ├── utils.ts              # cn(), formatDate(), etc.
│   │   │   ├── constants.ts
│   │   │   ├── validators.ts         # Zod schemas shared or duplicated
│   │   │   ├── formatters.ts         # Currency, date, phone
│   │   │   └── permissions.ts        # Permission check helpers
│   │   │
│   │   ├── components/               # Shared UI components
│   │   │   ├── ui/                   # shadcn/ui primitives (button, input, etc.)
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx      # Sidebar + header + main
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Breadcrumbs.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── data-table/
│   │   │   │   ├── DataTable.tsx     # Generic sortable, paginated table
│   │   │   │   ├── ColumnHeader.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   ├── forms/
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   └── RichTextEditor.tsx
│   │   │   ├── charts/
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── LineChart.tsx
│   │   │   │   └── PieChart.tsx
│   │   │   ├── feedback/
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── LoadingState.tsx
│   │   │   ├── auth/
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── PermissionGate.tsx
│   │   │   │   └── RoleBadge.tsx
│   │   │   └── shared/
│   │   │       ├── Avatar.tsx
│   │   │       ├── SearchInput.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── PageHeader.tsx
│   │   │       └── CardGrid.tsx
│   │   │
│   │   ├── features/                 # Feature modules (pages + feature-specific components)
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── LogoutPage.tsx
│   │   │   │   ├── ResetPasswordPage.tsx
│   │   │   │   └── TwoFactorPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   └── widgets/
│   │   │   │       ├── OpenMaintenanceWidget.tsx
│   │   │   │       ├── UpcomingInspectionsWidget.tsx
│   │   │   │       ├── VacanciesWidget.tsx
│   │   │   │       ├── MonthlyRevenueWidget.tsx
│   │   │   │       ├── TasksDueTodayWidget.tsx
│   │   │   │       ├── InventoryAlertsWidget.tsx
│   │   │   │       ├── EquipmentAlertsWidget.tsx
│   │   │   │       ├── WeatherWidget.tsx
│   │   │   │       ├── AnnouncementsWidget.tsx
│   │   │   │       └── RecentActivityWidget.tsx
│   │   │   ├── properties/
│   │   │   │   ├── PropertyListPage.tsx
│   │   │   │   ├── PropertyDetailPage.tsx
│   │   │   │   ├── PropertyFormPage.tsx
│   │   │   │   └── components/
│   │   │   │       ├── PropertyCard.tsx
│   │   │   │       ├── PropertyMap.tsx
│   │   │   │       ├── PropertyPictures.tsx
│   │   │   │       ├── PropertyUnits.tsx
│   │   │   │       ├── PropertyLeaseHistory.tsx
│   │   │   │       ├── PropertyMaintenanceHistory.tsx
│   │   │   │       ├── PropertyDocuments.tsx
│   │   │   │       ├── PropertyInsurance.tsx
│   │   │   │       ├── PropertyUtilities.tsx
│   │   │   │       ├── PropertyNotes.tsx
│   │   │   │       └── PropertyInspections.tsx
│   │   │   ├── units/
│   │   │   │   ├── UnitListPage.tsx
│   │   │   │   ├── UnitDetailPage.tsx
│   │   │   │   ├── UnitFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── tenants/
│   │   │   │   ├── TenantListPage.tsx
│   │   │   │   ├── TenantDetailPage.tsx
│   │   │   │   ├── TenantFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── leases/
│   │   │   │   ├── LeaseListPage.tsx
│   │   │   │   ├── LeaseDetailPage.tsx
│   │   │   │   ├── LeaseFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── maintenance/
│   │   │   │   ├── RequestListPage.tsx
│   │   │   │   ├── RequestDetailPage.tsx
│   │   │   │   ├── RequestFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── work-orders/
│   │   │   │   ├── WorkOrderListPage.tsx
│   │   │   │   ├── WorkOrderDetailPage.tsx
│   │   │   │   ├── WorkOrderFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── scheduling/
│   │   │   │   ├── SchedulePage.tsx
│   │   │   │   └── components/
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeListPage.tsx
│   │   │   │   ├── EmployeeDetailPage.tsx
│   │   │   │   ├── EmployeeFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryListPage.tsx
│   │   │   │   ├── InventoryDetailPage.tsx
│   │   │   │   ├── InventoryFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── equipment/
│   │   │   │   ├── EquipmentListPage.tsx
│   │   │   │   ├── EquipmentDetailPage.tsx
│   │   │   │   ├── EquipmentFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── vendors/
│   │   │   │   ├── VendorListPage.tsx
│   │   │   │   ├── VendorDetailPage.tsx
│   │   │   │   ├── VendorFormPage.tsx
│   │   │   │   └── components/
│   │   │   ├── documents/
│   │   │   │   ├── DocumentListPage.tsx
│   │   │   │   ├── DocumentViewerPage.tsx
│   │   │   │   └── components/
│   │   │   ├── messaging/
│   │   │   │   ├── InboxPage.tsx
│   │   │   │   ├── ThreadPage.tsx
│   │   │   │   └── components/
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationCenter.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportListPage.tsx
│   │   │   │   ├── ReportBuilderPage.tsx
│   │   │   │   └── components/
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsPage.tsx
│   │   │   ├── ai/
│   │   │   │   └── AIChatPage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── UserManagementPage.tsx
│   │   │   │   ├── RoleManagementPage.tsx
│   │   │   │   └── SystemSettingsPage.tsx
│   │   │   ├── audit-log/
│   │   │   │   └── AuditLogPage.tsx
│   │   │   └── settings/
│   │   │       ├── ProfilePage.tsx
│   │   │       ├── SecurityPage.tsx
│   │   │       ├── NotificationsPage.tsx
│   │   │       └── PreferencesPage.tsx
│   │   │
│   │   ├── stores/                    # Zustand or Context stores
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── notificationStore.ts
│   │   │
│   │   ├── types/                     # TypeScript type definitions
│   │   │   ├── api.ts                 # API response/request types
│   │   │   ├── auth.ts
│   │   │   ├── property.ts
│   │   │   ├── unit.ts
│   │   │   ├── tenant.ts
│   │   │   ├── lease.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── work-order.ts
│   │   │   ├── employee.ts
│   │   │   ├── inventory.ts
│   │   │   ├── equipment.ts
│   │   │   ├── vendor.ts
│   │   │   ├── document.ts
│   │   │   ├── message.ts
│   │   │   ├── notification.ts
│   │   │   ├── report.ts
│   │   │   ├── analytics.ts
│   │   │   ├── audit-log.ts
│   │   │   └── settings.ts
│   │   │
│   │   └── mocks/                     # MSW handlers for testing
│   │       ├── handlers.ts
│   │       └── server.ts
│   │
│   ├── index.html
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── components.json               # shadcn/ui config
│   ├── .env.example
│   ├── vitest.config.ts
│   └── package.json
│
├── backend/                           # FastAPI application
│   ├── alembic/
│   │   ├── versions/                 # Migration files
│   │   ├── env.py
│   │   └── alembic.ini
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app factory
│   │   ├── config.py                 # Settings via pydantic-settings
│   │   ├── dependencies.py           # FastAPI dependency injection
│   │   ├── exceptions.py             # Custom exception classes
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # JWT validation middleware
│   │   │   ├── audit.py             # Request audit logging
│   │   │   ├── rate_limit.py        # Rate limiting
│   │   │   └── cors.py              # CORS configuration
│   │   │
│   │   ├── core/                     # Domain logic (no framework imports)
│   │   │   ├── __init__.py
│   │   │   ├── auth/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interfaces.py    # AuthProvider, TokenService abstract classes
│   │   │   │   ├── jwt_service.py   # JWT creation/validation
│   │   │   │   ├── password_service.py  # Hashing/verification
│   │   │   │   └── permissions.py   # Permission registry + check logic
│   │   │   ├── storage/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interfaces.py    # StorageProvider abstract class
│   │   │   │   ├── local_storage.py
│   │   │   │   └── s3_storage.py    # Future
│   │   │   ├── ai/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interfaces.py    # AIProvider abstract class
│   │   │   │   ├── llm_provider.py  # Generic LLM provider
│   │   │   │   ├── openai_provider.py
│   │   │   │   ├── ollama_provider.py
│   │   │   │   └── local_provider.py
│   │   │   ├── notifications/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interfaces.py
│   │   │   │   ├── email_provider.py
│   │   │   │   ├── sms_provider.py
│   │   │   │   └── in_app_provider.py
│   │   │   └── reporting/
│   │   │       ├── __init__.py
│   │   │       ├── interfaces.py
│   │   │       └── report_engine.py
│   │   │
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Declarative base, mixins (TimestampMixin, SoftDeleteMixin)
│   │   │   ├── user.py
│   │   │   ├── role.py
│   │   │   ├── property.py
│   │   │   ├── unit.py
│   │   │   ├── tenant.py
│   │   │   ├── lease.py
│   │   │   ├── maintenance_request.py
│   │   │   ├── work_order.py
│   │   │   ├── schedule.py
│   │   │   ├── employee.py
│   │   │   ├── inventory_item.py
│   │   │   ├── equipment.py
│   │   │   ├── vendor.py
│   │   │   ├── document.py
│   │   │   ├── message.py
│   │   │   ├── notification.py
│   │   │   ├── audit_log.py
│   │   │   ├── inspection.py
│   │   │   ├── announcement.py
│   │   │   └── settings.py
│   │   │
│   │   ├── schemas/                  # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   ├── unit.py
│   │   │   ├── tenant.py
│   │   │   ├── lease.py
│   │   │   ├── maintenance.py
│   │   │   ├── work_order.py
│   │   │   ├── schedule.py
│   │   │   ├── employee.py
│   │   │   ├── inventory.py
│   │   │   ├── equipment.py
│   │   │   ├── vendor.py
│   │   │   ├── document.py
│   │   │   ├── message.py
│   │   │   ├── notification.py
│   │   │   ├── report.py
│   │   │   ├── analytics.py
│   │   │   ├── audit_log.py
│   │   │   ├── ai.py
│   │   │   ├── settings.py
│   │   │   └── common.py            # Pagination, filters, error response
│   │   │
│   │   ├── repositories/            # Data access layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # BaseRepository with CRUD
│   │   │   ├── user_repository.py
│   │   │   ├── property_repository.py
│   │   │   ├── unit_repository.py
│   │   │   ├── tenant_repository.py
│   │   │   ├── lease_repository.py
│   │   │   ├── maintenance_request_repository.py
│   │   │   ├── work_order_repository.py
│   │   │   ├── schedule_repository.py
│   │   │   ├── employee_repository.py
│   │   │   ├── inventory_repository.py
│   │   │   ├── equipment_repository.py
│   │   │   ├── vendor_repository.py
│   │   │   ├── document_repository.py
│   │   │   ├── message_repository.py
│   │   │   ├── notification_repository.py
│   │   │   ├── audit_log_repository.py
│   │   │   └── settings_repository.py
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── property_service.py
│   │   │   ├── unit_service.py
│   │   │   ├── tenant_service.py
│   │   │   ├── lease_service.py
│   │   │   ├── maintenance_service.py
│   │   │   ├── work_order_service.py
│   │   │   ├── schedule_service.py
│   │   │   ├── employee_service.py
│   │   │   ├── inventory_service.py
│   │   │   ├── equipment_service.py
│   │   │   ├── vendor_service.py
│   │   │   ├── document_service.py
│   │   │   ├── messaging_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── report_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── dashboard_service.py
│   │   │   └── settings_service.py
│   │   │
│   │   ├── api/                      # FastAPI route handlers
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py        # Aggregate router
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── properties.py
│   │   │   │   ├── units.py
│   │   │   │   ├── tenants.py
│   │   │   │   ├── leases.py
│   │   │   │   ├── maintenance.py
│   │   │   │   ├── work_orders.py
│   │   │   │   ├── schedules.py
│   │   │   │   ├── employees.py
│   │   │   │   ├── inventory.py
│   │   │   │   ├── equipment.py
│   │   │   │   ├── vendors.py
│   │   │   │   ├── documents.py
│   │   │   │   ├── messaging.py
│   │   │   │   ├── notifications.py
│   │   │   │   ├── reports.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── ai.py
│   │   │   │   ├── admin.py
│   │   │   │   ├── audit_logs.py
│   │   │   │   ├── dashboard.py
│   │   │   │   └── settings.py
│   │   │   └── deps.py             # Route-specific dependencies
│   │   │
│   │   └── tasks/                    # Background/celery tasks
│   │       ├── __init__.py
│   │       ├── celery_app.py
│   │       ├── email_tasks.py
│   │       ├── notification_tasks.py
│   │       ├── report_generation.py
│   │       └── maintenance_reminders.py
│   │
│   ├── tests/                        # Backend tests
│   │   ├── __init__.py
│   │   ├── conftest.py              # Fixtures, test DB, test client
│   │   ├── factories.py             # Factory boy factories
│   │   ├── unit/
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_property_service.py
│   │   │   └── ...
│   │   ├── integration/
│   │   │   ├── test_auth_api.py
│   │   │   ├── test_properties_api.py
│   │   │   └── ...
│   │   └── e2e/
│   │       ├── test_property_lifecycle.py
│   │       └── test_tenant_lifecycle.py
│   │
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   ├── .env.example
│   ├── pyproject.toml
│   └── Dockerfile
│
├── database/                          # Database configuration
│   ├── init.sql                      # Initial setup (extensions, roles, etc.)
│   ├── seed.sql                      # Development seed data
│   └── Dockerfile
│
├── docker/                            # Docker Compose configurations
│   ├── docker-compose.yml            # Dev environment
│   ├── docker-compose.prod.yml       # Production overrides
│   ├── postgres/
│   │   └── postgresql.conf
│   └── nginx/
│       ├── nginx.conf
│       └── ssl/
├── docs/                              # Developer documentation
│   ├── ARCHITECTURE.md               # This document
│   ├── CONTRIBUTING.md
│   ├── API.md                        # API documentation
│   ├── DATABASE.md                   # Database schema reference
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   ├── AI.md                         # AI module design
│   └── modules/                      # Per-module documentation
│       ├── properties.md
│       ├── maintenance.md
│       └── ...
├── scripts/                           # Utility scripts
│   ├── setup-dev.sh                  # Bootstrap development environment
│   ├── seed-db.sh
│   ├── migrate.sh
│   └── backup.sh
├── ai/                                # AI configuration & model files
│   ├── prompts/
│   │   ├── system.md
│   │   └── query-templates/
│   ├── config.yaml
│   └── models/
├── shared/                            # Shared type definitions / contracts
│   ├── types/                         # Python types shared between services
│   └── constants/
├── uploads/                           # Local file storage root
│   ├── properties/
│   ├── documents/
│   ├── inspections/
│   ├── maintenance/
│   └── avatars/
├── backups/                           # Database backups
├── tests/                             # Top-level e2e / Playwright tests
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── properties.spec.ts
│   │   └── ...
│   └── playwright.config.ts
└── infra/                             # Infrastructure as Code (future)
    ├── proxmox/
    └── ansible/
```

---

## 3. Database Design

### 3.1 Entity-Relationship Diagram (Textual)

```
USERS ──< USER_ROLES >── ROLES
  │
  ├──< EMPLOYEES (1:1)
  ├──< TENANTS (1:1)
  ├──< AUDIT_LOGS
  ├──< NOTIFICATIONS
  └──< MESSAGES

PROPERTIES ──< UNITS
  │              │
  │              ├──< TENANTS (via LEASES)
  │              ├──< MAINTENANCE_REQUESTS
  │              └──< INSPECTIONS
  │
  ├──< DOCUMENTS (polymorphic: DOCUMENT.related_type + related_id)
  ├──< INSURANCE_POLICIES
  ├──< UTILITY_ACCOUNTS
  ├──< NOTES
  └──< INSPECTIONS

LEASES ──< TENANTS
  │
  ├──< UNITS
  ├──< DOCUMENTS
  ├──< PAYMENTS
  ├──< MOVE_IN_CHECKLIST
  └──< MOVE_OUT_CHECKLIST

MAINTENANCE_REQUESTS ──< WORK_ORDERS
  │                       │
  │                       ├──< EMPLOYEES (assigned)
  │                       ├──< SCHEDULES
  │                       ├──< INVENTORY_ITEMS (materials used)
  │                       ├──< EQUIPMENT (used)
  │                       ├──< DOCUMENTS / PHOTOS
  │                       └──< INVOICES
  │
  └──< PROPERTIES / UNITS

INVENTORY_ITems ──< SUPPLIERS (VENDORS)
  │
  └──< INVENTORY_CATEGORIES

EQUIPMENT ──< EQUIPMENT_CATEGORIES
  │
  ├──< MAINTENANCE_RECORDS
  ├──< WARRANTIES
  └──< EMPLOYEES (assigned)

VENDORS ──< VENDOR_CONTRACTS
  │
  ├──< INVENTORY_ITEMS (as supplier)
  └──< WORK_ORDERS (as contractor)

MESSAGES ──< USERS (sender + recipients via MESSAGE_RECIPIENTS)
  │
  └──< DOCUMENTS (attachments)

SCHEDULES ──< SCHEDULABLE (polymorphic: WORK_ORDERS, INSPECTIONS, TASKS)
```

### 3.2 Core Tables

#### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | | |
| avatar_url | TEXT | | |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| is_2fa_enabled | BOOLEAN | NOT NULL, DEFAULT false | |
| 2fa_secret | VARCHAR(64) | | Encrypted |
| password_reset_token | VARCHAR(255) | | |
| password_reset_expires | TIMESTAMPTZ | | |
| last_login_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |
| deleted_at | TIMESTAMPTZ | | Soft delete |

#### `roles`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | admin, manager, maint_supervisor, maint_tech, office_staff, property_manager, tenant, auditor |
| description | TEXT | | |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | Prevent deletion of system roles |
| permissions | JSONB | NOT NULL | See permission model below |

#### `user_roles`

| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | FK → users.id, PK |
| role_id | UUID | FK → roles.id, PK |
| property_id | UUID | FK → properties.id, NULLABLE (scope) |
| assigned_by | UUID | FK → users.id |
| assigned_at | TIMESTAMPTZ | |

A user can have multiple roles. A role can be scoped to a property (e.g., "Property Manager for Property X").

#### `properties`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| type | VARCHAR(50) | NOT NULL | residential, commercial, mixed |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'active' | active, inactive, under_renovation |
| address_line1 | VARCHAR(255) | NOT NULL | |
| address_line2 | VARCHAR(255) | | |
| city | VARCHAR(100) | NOT NULL | |
| state | VARCHAR(50) | NOT NULL | |
| zip_code | VARCHAR(20) | NOT NULL | |
| country | VARCHAR(100) | NOT NULL, DEFAULT 'US' | |
| latitude | DECIMAL(10,7) | | |
| longitude | DECIMAL(10,7) | | |
| owner_name | VARCHAR(255) | | |
| owner_contact | TEXT | | |
| year_built | INTEGER | | |
| total_units | INTEGER | NOT NULL, DEFAULT 0 | Denormalized, updated via trigger/app |
| total_sqft | DECIMAL(10,2) | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |
| deleted_at | TIMESTAMPTZ | | |

#### `units`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| property_id | UUID | FK → properties.id, NOT NULL | |
| unit_label | VARCHAR(50) | NOT NULL | Apt #, Suite #, etc. |
| unit_type | VARCHAR(50) | NOT NULL | studio, 1br, 2br, 3br, commercial |
| bedrooms | INTEGER | | |
| bathrooms | DECIMAL(3,1) | | |
| sqft | DECIMAL(10,2) | | |
| monthly_rent | DECIMAL(10,2) | | Current market rent |
| security_deposit | DECIMAL(10,2) | | |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'vacant' | vacant, occupied, maintenance, reserved |
| floor | INTEGER | | |
| features | JSONB | | e.g., {"has_washer": true, "has_dishwasher": false} |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |
| deleted_at | TIMESTAMPTZ | | |

#### `tenants`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NULLABLE (portal account) |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| phone_alt | VARCHAR(20) | |
| emergency_contact_name | VARCHAR(255) | |
| emergency_contact_phone | VARCHAR(20) | |
| emergency_contact_relation | VARCHAR(50) | |
| ssn_last4 | VARCHAR(4) | Encrypted |
| date_of_birth | DATE | |
| employer | VARCHAR(255) | |
| annual_income | DECIMAL(10,2) | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `leases`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants.id, NOT NULL |
| unit_id | UUID | FK → units.id, NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| monthly_rent | DECIMAL(10,2) | NOT NULL |
| security_deposit | DECIMAL(10,2) | |
| deposit_held_by | VARCHAR(50) | DEFAULT 'landlord' |
| status | VARCHAR(50) | active, expired, terminated, renewed |
| terms | TEXT | Custom lease terms |
| auto_renew | BOOLEAN | DEFAULT false |
| renewal_notice_days | INTEGER | DEFAULT 60 |
| documents | JSONB | List of attached document IDs or metadata |
| signed_at | TIMESTAMPTZ | |
| terminated_at | TIMESTAMPTZ | |
| termination_reason | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `maintenance_requests`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| property_id | UUID | FK → properties.id, NOT NULL |
| unit_id | UUID | FK → units.id, NULLABLE |
| tenant_id | UUID | FK → tenants.id, NULLABLE |
| requested_by | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | low, medium, high, emergency |
| category | VARCHAR(100) | plumbing, electrical, hvac, appliance, structural, pest, other |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'open' | open, assigned, in_progress, completed, cancelled |
| is_emergency | BOOLEAN | DEFAULT false |
| tenant_accessible | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `work_orders`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| maintenance_request_id | UUID | FK → maintenance_requests.id, NULLABLE |
| property_id | UUID | FK → properties.id, NOT NULL |
| unit_id | UUID | FK → units.id, NULLABLE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | pending, scheduled, in_progress, completed, approved, invoiced |
| scheduled_start | TIMESTAMPTZ | |
| scheduled_end | TIMESTAMPTZ | |
| actual_start | TIMESTAMPTZ | |
| actual_end | TIMESTAMPTZ | |
| estimated_hours | DECIMAL(5,1) | |
| actual_hours | DECIMAL(5,1) | |
| notes | TEXT | |
| completion_notes | TEXT | |
| is_billable | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `work_order_assignees`

| Column | Type | Constraints |
|---|---|---|
| work_order_id | UUID | FK → work_orders.id, PK |
| employee_id | UUID | FK → employees.id, PK |

#### `work_order_materials`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| work_order_id | UUID | FK → work_orders.id |
| inventory_item_id | UUID | FK → inventory_items.id |
| quantity_used | DECIMAL(10,2) | NOT NULL |
| unit_cost | DECIMAL(10,2) | |
| created_at | TIMESTAMPTZ | |

#### `inventory_items`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| category_id | UUID | FK → inventory_categories.id |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| sku | VARCHAR(100) | |
| barcode | VARCHAR(100) | |
| qr_code | TEXT | |
| quantity | DECIMAL(10,2) | NOT NULL, DEFAULT 0 |
| unit_of_measure | VARCHAR(50) | each, gallon, lb, ft, box |
| min_stock_level | DECIMAL(10,2) | DEFAULT 0 |
| location | VARCHAR(255) | e.g., "Warehouse A, Shelf 3" |
| supplier_id | UUID | FK → vendors.id |
| cost_per_unit | DECIMAL(10,2) | |
| purchase_date | DATE | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `equipment`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| category_id | UUID | FK → equipment_categories.id |
| name | VARCHAR(255) | NOT NULL |
| make | VARCHAR(100) | |
| model | VARCHAR(100) | |
| serial_number | VARCHAR(100) | |
| year | INTEGER | |
| purchase_date | DATE | |
| purchase_price | DECIMAL(10,2) | |
| current_value | DECIMAL(10,2) | |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'available' | available, in_use, maintenance, retired |
| current_location | VARCHAR(255) | |
| assigned_employee_id | UUID | FK → employees.id |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `documents`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| related_type | VARCHAR(50) | NOT NULL | property, unit, tenant, lease, work_order, employee, vendor |
| related_id | UUID | NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | |
| file_path | TEXT | NOT NULL | Path in storage |
| file_type | VARCHAR(100) | | MIME type |
| file_size | BIGINT | | Size in bytes |
| version | INTEGER | DEFAULT 1 | |
| uploaded_by | UUID | FK → users.id |
| created_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

#### `messages`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| sender_id | UUID | FK → users.id, NOT NULL |
| subject | VARCHAR(255) | |
| body | TEXT | NOT NULL |
| is_urgent | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |

#### `message_recipients`

| Column | Type | Constraints |
|---|---|---|
| message_id | UUID | FK → messages.id, PK |
| recipient_id | UUID | FK → users.id, PK |
| read_at | TIMESTAMPTZ | |

#### `audit_logs`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| action | VARCHAR(100) | NOT NULL | create, update, delete, view, login, export |
| entity_type | VARCHAR(50) | NOT NULL | |
| entity_id | UUID | | |
| changes | JSONB | | Before/after values |
| ip_address | INET | | |
| user_agent | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `notifications`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | |
| link | TEXT | URL to related resource |
| read_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL |

### 3.3 Indexing Strategy

| Table | Index | Type | Rationale |
|---|---|---|---|
| properties | (city, state) | B-tree | Location-based queries |
| properties | status | B-tree | Filter active/inactive |
| units | (property_id, status) | B-tree | Unit availability per property |
| leases | (tenant_id, status) | B-tree | Active lease lookup |
| leases | (unit_id, status) | B-tree | Unit current lease |
| maintenance_requests | (property_id, status) | B-tree | Open requests per property |
| maintenance_requests | priority, created_at | B-tree | Emergency sorting |
| work_orders | (assigned_employee_id, status) | B-tree | Employee workload |
| inventory_items | (category_id, quantity) | B-tree | Low stock alerts |
| audit_logs | (user_id, created_at) | B-tree | User audit trail |
| audit_logs | (entity_type, entity_id) | B-tree | Per-entity audit trail |
| notifications | (user_id, read_at) | B-tree | Unread notifications |
| documents | (related_type, related_id) | B-tree | Polymorphic lookup |
| messages | sender_id | B-tree | Sent messages |
| message_recipients | (recipient_id, read_at) | B-tree | Unread messages |

### 3.4 JSONB Usage

JSONB columns are used for:
- `roles.permissions` — Structured permission map
- `units.features` — Flexible unit amenities
- `maintenance_request.metadata` — Extensible request metadata
- `settings.config` — Key-value configuration

JSONB is NOT used where relational integrity matters (e.g., addresses, contacts).

---

## 4. API Design

### 4.1 General Conventions

| Convention | Standard |
|---|---|
| **Base URL** | `/api/v1` |
| **Format** | JSON (REST) |
| **Naming** | Plural nouns, kebab-case for multi-word: `/properties`, `/work-orders` |
| **IDs** | UUID v4 |
| **Pagination** | `?page=1&per_page=25` → `{ data: [], meta: { page, per_page, total, total_pages } }` |
| **Filtering** | Query params: `?status=active&city=Austin` |
| **Sorting** | `?sort=created_at&order=desc` |
| **Search** | `?q=search_term` (full-text search across relevant fields) |
| **Includes** | `?include=unit,tenant` (eager loading of relations) |
| **Fields** | `?fields=id,name,email` (sparse fieldsets) |
| **Errors** | Consistent format: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }` |
| **HTTP Methods** | GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (soft delete) |
| **Versioning** | URL-based (`/api/v1/...`) |
| **Rate Limiting** | Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

### 4.2 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_EMAIL"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### 4.3 API Endpoints

#### Authentication

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| POST | `/auth/logout` | Invalidate refresh token | Yes |
| POST | `/auth/reset-password` | Request password reset email | No |
| POST | `/auth/reset-password/confirm` | Execute password reset | No (token) |
| POST | `/auth/2fa/setup` | Enable 2FA | Yes |
| POST | `/auth/2fa/verify` | Verify 2FA code | Yes |
| GET | `/auth/me` | Current user profile | Yes |
| PATCH | `/auth/me` | Update current user profile | Yes |

#### Users (Admin)

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/users` | List users | Admin |
| GET | `/users/{id}` | Get user detail | Admin |
| POST | `/users` | Create user | Admin |
| PATCH | `/users/{id}` | Update user | Admin |
| DELETE | `/users/{id}` | Soft-delete user | Admin |
| GET | `/users/{id}/roles` | Get user roles | Admin |
| POST | `/users/{id}/roles` | Assign role | Admin |
| DELETE | `/users/{id}/roles/{role_id}` | Remove role | Admin |

#### Roles (Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/roles` | List roles |
| GET | `/roles/{id}` | Get role detail |
| POST | `/roles` | Create role |
| PATCH | `/roles/{id}` | Update role permissions |
| DELETE | `/roles/{id}` | Delete custom role |

#### Properties

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/properties` | List properties | All (filtered by scope) |
| POST | `/properties` | Create property | Admin, Manager |
| GET | `/properties/{id}` | Get property detail | All (scoped) |
| PATCH | `/properties/{id}` | Update property | Admin, Manager, Property Manager (scoped) |
| DELETE | `/properties/{id}` | Soft-delete property | Admin |
| GET | `/properties/{id}/stats` | Property statistics | Manager+ |
| GET | `/properties/{id}/units` | Property units | All (scoped) |
| GET | `/properties/{id}/tenants` | Property tenants | All (scoped) |
| GET | `/properties/{id}/maintenance` | Property maintenance | All (scoped) |
| GET | `/properties/{id}/documents` | Property documents | All (scoped) |
| POST | `/properties/{id}/documents` | Upload document | Office Staff+ |
| GET | `/properties/{id}/inspections` | Property inspections | Manager+ |
| POST | `/properties/{id}/inspections` | Create inspection | Manager+ |
| GET | `/properties/{id}/insurance` | Insurance policies | Manager+ |
| POST | `/properties/{id}/insurance` | Add insurance | Manager+ |
| PATCH | `/properties/{id}/insurance/{ins_id}` | Update insurance | Manager+ |
| GET | `/properties/{id}/utilities` | Utility accounts | Manager+ |
| POST | `/properties/{id}/utilities` | Add utility | Office Staff+ |
| PATCH | `/properties/{id}/utilities/{util_id}` | Update utility | Office Staff+ |
| PATCH | `/properties/{id}/notes` | Update notes | Office Staff+ |

#### Units

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/units` | List units (filterable) | All (scoped) |
| POST | `/units` | Create unit | Admin, Manager |
| GET | `/units/{id}` | Get unit detail | All (scoped) |
| PATCH | `/units/{id}` | Update unit | Admin, Manager, Property Manager (scoped) |
| DELETE | `/units/{id}` | Soft-delete unit | Admin |
| GET | `/units/{id}/leases` | Unit lease history | Manager+ |
| GET | `/units/{id}/maintenance` | Unit maintenance history | All (scoped) |

#### Tenants

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/tenants` | List tenants (filterable) | All (scoped) |
| POST | `/tenants` | Create tenant | Office Staff+ |
| GET | `/tenants/{id}` | Get tenant detail | All (scoped) |
| PATCH | `/tenants/{id}` | Update tenant | Office Staff+ |
| DELETE | `/tenants/{id}` | Soft-delete tenant | Admin |
| GET | `/tenants/{id}/leases` | Tenant leases | All (scoped) |
| GET | `/tenants/{id}/payments` | Payment history | Manager+ |
| GET | `/tenants/{id}/maintenance` | Tenant maintenance requests | All (scoped) |
| GET | `/tenants/{id}/documents` | Tenant documents | Office Staff+ |
| POST | `/tenants/{id}/documents` | Upload tenant document | Office Staff+ |
| GET | `/tenants/{id}/move-in` | Move-in checklist | Office Staff+ |
| PATCH | `/tenants/{id}/move-in` | Update move-in checklist | Office Staff+ |
| GET | `/tenants/{id}/move-out` | Move-out checklist | Office Staff+ |
| PATCH | `/tenants/{id}/move-out` | Update move-out checklist | Office Staff+ |

#### Leases

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/leases` | List leases | All (scoped) |
| POST | `/leases` | Create lease | Office Staff+ |
| GET | `/leases/{id}` | Get lease detail | All (scoped) |
| PATCH | `/leases/{id}` | Update lease | Office Staff+ |
| DELETE | `/leases/{id}` | Soft-delete lease | Admin |
| POST | `/leases/{id}/renew` | Renew lease | Office Staff+ |
| POST | `/leases/{id}/terminate` | Terminate lease | Manager+ |
| GET | `/leases/{id}/payments` | Lease payments | Manager+ |

#### Maintenance Requests

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/maintenance-requests` | List requests | All (scoped) |
| POST | `/maintenance-requests` | Create request | All |
| GET | `/maintenance-requests/{id}` | Get request detail | All (scoped) |
| PATCH | `/maintenance-requests/{id}` | Update request | All (scoped, limited) |
| DELETE | `/maintenance-requests/{id}` | Soft-delete | Admin, Manager |
| POST | `/maintenance-requests/{id}/assign` | Assign to employee | Maintenance Supervisor+ |
| POST | `/maintenance-requests/{id}/priority` | Set priority | Maintenance Supervisor+ |

#### Work Orders

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/work-orders` | List work orders | All (scoped) |
| POST | `/work-orders` | Create work order | Maintenance Supervisor+ |
| GET | `/work-orders/{id}` | Get work order detail | All (scoped) |
| PATCH | `/work-orders/{id}` | Update work order | Maintenance Supervisor+ |
| DELETE | `/work-orders/{id}` | Soft-delete | Admin |
| POST | `/work-orders/{id}/assign` | Assign employees | Maintenance Supervisor+ |
| POST | `/work-orders/{id}/start` | Start work | Assigned Tech |
| POST | `/work-orders/{id}/complete` | Complete work | Assigned Tech |
| POST | `/work-orders/{id}/approve` | Approve work | Maintenance Supervisor+ |
| POST | `/work-orders/{id}/photos` | Add photos | Assigned Tech+ |
| GET | `/work-orders/{id}/photos` | Get photos | All (scoped) |
| POST | `/work-orders/{id}/materials` | Log materials used | Assigned Tech+ |
| POST | `/work-orders/{id}/invoice` | Add invoice | Office Staff+ |

#### Schedules

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/schedules` | List schedules (filterable) | All (scoped) |
| POST | `/schedules` | Create schedule event | Maintenance Supervisor+ |
| PATCH | `/schedules/{id}` | Update schedule | Maintenance Supervisor+ |
| DELETE | `/schedules/{id}` | Delete schedule | Maintenance Supervisor+ |
| GET | `/schedules/calendar` | Calendar view (date range) | All (scoped) |

#### Employees

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/employees` | List employees | Manager+ |
| POST | `/employees` | Create employee | Admin |
| GET | `/employees/{id}` | Get employee detail | Manager+ |
| PATCH | `/employees/{id}` | Update employee | Admin |
| DELETE | `/employees/{id}` | Soft-delete | Admin |
| GET | `/employees/{id}/work-orders` | Employee work orders | Manager+ |
| GET | `/employees/{id}/schedule` | Employee schedule | Manager+, Self |

#### Inventory

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/inventory` | List inventory | All (scoped) |
| POST | `/inventory` | Create inventory item | Maintenance Supervisor+ |
| GET | `/inventory/{id}` | Get item detail | All (scoped) |
| PATCH | `/inventory/{id}` | Update item | Maintenance Supervisor+ |
| DELETE | `/inventory/{id}` | Soft-delete | Admin |
| GET | `/inventory/low-stock` | Low stock alerts | Maintenance Supervisor+ |
| POST | `/inventory/{id}/adjust` | Adjust quantity | Maintenance Supervisor+ |
| GET | `/inventory/categories` | List categories | All |
| POST | `/inventory/categories` | Create category | Admin |

#### Equipment

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/equipment` | List equipment | All (scoped) |
| POST | `/equipment` | Create equipment | Manager+ |
| GET | `/equipment/{id}` | Get equipment detail | All (scoped) |
| PATCH | `/equipment/{id}` | Update equipment | Manager+ |
| DELETE | `/equipment/{id}` | Soft-delete | Admin |
| GET | `/equipment/{id}/maintenance` | Maintenance history | Maintenance Supervisor+ |
| POST | `/equipment/{id}/maintenance` | Log maintenance | Maintenance Supervisor+ |
| GET | `/equipment/categories` | List categories | All |
| POST | `/equipment/categories` | Create category | Admin |

#### Vendors

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/vendors` | List vendors | All (scoped) |
| POST | `/vendors` | Create vendor | Office Staff+ |
| GET | `/vendors/{id}` | Get vendor detail | All (scoped) |
| PATCH | `/vendors/{id}` | Update vendor | Office Staff+ |
| DELETE | `/vendors/{id}` | Soft-delete | Admin |
| GET | `/vendors/{id}/contracts` | Vendor contracts | Manager+ |
| POST | `/vendors/{id}/contracts` | Add contract | Manager+ |
| GET | `/vendors/{id}/work-orders` | Vendor work orders | Manager+ |
| GET | `/vendors/{id}/inventory` | Vendor-supplied inventory | Maintenance Supervisor+ |

#### Documents

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/documents` | List documents (filterable) | All (scoped) |
| POST | `/documents` | Upload document | All (scoped) |
| GET | `/documents/{id}` | Download/view document | All (scoped) |
| PATCH | `/documents/{id}` | Update document metadata | Office Staff+ |
| DELETE | `/documents/{id}` | Soft-delete | Manager+ |
| GET | `/documents/{id}/versions` | Version history | Manager+ |
| POST | `/documents/{id}/versions` | Upload new version | Office Staff+ |

#### Messaging

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/messages` | List messages (inbox) | All |
| POST | `/messages` | Send message | All |
| GET | `/messages/{id}` | Get message detail | Participant |
| DELETE | `/messages/{id}` | Soft-delete | Participant |
| GET | `/messages/{id}/attachments` | Message attachments | Participant |
| GET | `/messages/unread-count` | Unread count | All |

#### Notifications

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/notifications` | List notifications | All |
| PATCH | `/notifications/{id}/read` | Mark as read | All |
| POST | `/notifications/read-all` | Mark all as read | All |
| GET | `/notifications/unread-count` | Unread count | All |

#### Reports

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/reports` | List report definitions | Manager+ |
| POST | `/reports` | Create custom report | Manager+ |
| GET | `/reports/{id}` | Get report detail | Manager+ |
| POST | `/reports/{id}/generate` | Generate report | Manager+ |
| GET | `/reports/{id}/download` | Download generated report | Manager+ |

#### Analytics

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/analytics/occupancy` | Occupancy rates | Manager+ |
| GET | `/analytics/revenue` | Revenue analytics | Manager+ |
| GET | `/analytics/maintenance` | Maintenance analytics | Manager+ |
| GET | `/analytics/expenses` | Expense analytics | Manager+ |

#### AI

| Method | Path | Description | Required Role |
|---|---|---|---|
| POST | `/ai/chat` | Send message to AI assistant | Manager+ |
| GET | `/ai/conversations` | List AI conversations | Manager+ |
| DELETE | `/ai/conversations/{id}` | Delete conversation | Manager+ |
| GET | `/ai/models` | List available models | Admin |

#### Administration

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/admin/stats` | System statistics | Admin |
| GET | `/admin/system-logs` | System logs | Admin |
| PATCH | `/admin/settings` | Update system settings | Admin |

#### Audit Logs

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/audit-logs` | List audit logs | Admin, Auditor |
| GET | `/audit-logs/{id}` | Get audit log detail | Admin, Auditor |
| GET | `/audit-logs/export` | Export audit logs | Admin |

#### Dashboard

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/dashboard/summary` | Dashboard summary data | All |
| GET | `/dashboard/widgets/{widget_type}` | Individual widget data | All |

#### Settings

| Method | Path | Description | Required Role |
|---|---|---|---|
| GET | `/settings` | User settings | All (own) |
| PATCH | `/settings` | Update user settings | All (own) |
| GET | `/settings/company` | Company settings | Admin |
| PATCH | `/settings/company` | Update company settings | Admin |

---

## 5. Authentication Flow

### 5.1 Token Strategy

Company OS uses **dual-token JWT authentication**:

| Token | Location | Lifetime | Purpose |
|---|---|---|---|
| **Access Token** | `Authorization: Bearer <token>` (Header) | 15 minutes | API authorization |
| **Refresh Token** | `HttpOnly Secure SameSite=Strict` cookie or request body | 7 days | Obtain new access tokens |

### 5.2 Token Payloads

**Access Token:**
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "roles": ["admin", "property_manager"],
  "permissions": ["property:read", "property:write", ...],
  "scope": {"property_ids": ["uuid1", "uuid2"]},
  "type": "access",
  "iat": 1700000000,
  "exp": 1700000900
}
```

**Refresh Token:**
```json
{
  "sub": "user_uuid",
  "jti": "unique_token_id",
  "type": "refresh",
  "iat": 1700000000,
  "exp": 1700604800
}
```

### 5.3 Authentication Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  FastAPI  │         │PostgreSQL│
└────┬────┘         └────┬─────┘         └────┬─────┘
     │                   │                    │
     │  POST /auth/login │                    │
     │  {email, password}│                    │
     ├──────────────────►│                    │
     │                   │  SELECT user       │
     │                   ├───────────────────►│
     │                   │◄───────────────────┤
     │                   │                    │
     │                   │  verify bcrypt     │
     │                   │  generate tokens   │
     │                   │                    │
     │  { access_token,  │                    │
     │    refresh_token, │                    │
     │    expires_in }   │                    │
     │◄──────────────────┤                    │
     │                   │                    │
     │                   │                    │
     │  GET /api/v1/     │                    │
     │  properties       │                    │
     │  Authorization:   │                    │
     │  Bearer ey...     │                    │
     ├──────────────────►│                    │
     │                   │  verify JWT        │
     │                   │  check permissions │
     │                   │  return data       │
     │◄──────────────────┤                    │
     │                   │                    │
     │                   │                    │
     │  POST /auth/      │                    │
     │  refresh          │                    │
     │  {refresh_token}  │                    │
     ├──────────────────►│                    │
     │                   │  verify refresh JWT│
     │                   │  check if revoked  │
     │                   │  generate new      │
     │                   │  access token      │
     │  { access_token,  │                    │
     │    expires_in }   │                    │
     │◄──────────────────┤                    │
```

### 5.4 Frontend Integration

1. **Login**: `POST /auth/login` → store access_token in memory (Zustand store), refresh_token in memory or httpOnly cookie.
2. **API Calls**: Axios interceptor reads access_token from store, attaches `Authorization` header.
3. **Token Expiry**: On 401 response, interceptor calls `POST /auth/refresh` with refresh token. If successful, retries original request. If refresh fails, redirects to login.
4. **Logout**: `POST /auth/logout` → server revokes refresh token → client clears tokens → redirect to login.
5. **Password Reset**: Email with reset link → user clicks link → `POST /auth/reset-password/confirm` with token + new password.

### 5.5 Token Revocation

Refresh tokens are stored in a `refresh_tokens` table:

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| jti | VARCHAR(64) | Unique token ID |
| expires_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | NULL if active |
| replaced_by | VARCHAR(64) | Token rotation chain |

On logout, the refresh token is revoked (soft delete prevents reuse). On refresh, the old token is revoked and a new one issued (token rotation).

---

## 6. User Permissions

### 6.1 Permission Model

Permissions are structured as a JSONB object in the `roles` table:

```json
{
  "properties": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "units": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "tenants": {
    "read": true,
    "create": true,
    "update": true,
    "delete": false
  },
  "leases": {
    "read": true,
    "create": true,
    "update": true,
    "delete": false,
    "renew": true,
    "terminate": false
  },
  "maintenance": {
    "read": true,
    "create": true,
    "update": true,
    "delete": false,
    "assign": false,
    "set_priority": false
  },
  "work_orders": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false,
    "assign": false,
    "approve": false,
    "start": false,
    "complete": false,
    "log_materials": false
  },
  "schedules": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "employees": {
    "read": false,
    "create": false,
    "update": false,
    "delete": false
  },
  "inventory": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false,
    "adjust": false
  },
  "equipment": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "vendors": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  },
  "documents": {
    "read": true,
    "upload": false,
    "delete": false
  },
  "messages": {
    "send": true,
    "read": true,
    "delete": false
  },
  "reports": {
    "read": false,
    "create": false,
    "generate": false
  },
  "analytics": {
    "read": false
  },
  "ai": {
    "use": false,
    "configure": false
  },
  "admin": {
    "access": false,
    "manage_users": false,
    "manage_roles": false,
    "manage_settings": false
  },
  "audit_logs": {
    "read": false
  }
}
```

### 6.2 Role Definitions

| Role | Abbreviation | Description | Base Permissions |
|---|---|---|---|
| **Administrator** | `admin` | Full system access | All permissions true (god mode) |
| **Manager** | `manager` | Operational management | Full CRUD on properties, units, tenants, leases, employees, vendors; limited admin |
| **Maintenance Supervisor** | `maint_supervisor` | Oversees maintenance team | Full maintenance/work_order CRUD, assign/approve, inventory/equipment write |
| **Maintenance Technician** | `maint_tech` | Executes work orders | Read on most things; can start/complete assigned work orders, log materials, add photos |
| **Office Staff** | `office_staff` | Administrative support | CRUD on tenants, leases, vendors, documents; read on properties, units |
| **Property Manager** | `property_manager` | Manages assigned properties | Like Manager but scoped to assigned properties only |
| **Tenant** | `tenant` | Resident portal | Read own lease, create maintenance requests, send messages to property team |
| **Read-only Auditor** | `auditor` | Compliance monitoring | Read everything, no writes; can access audit logs |

### 6.3 Permission Enforcement

**Backend — Decorator pattern:**
```python
@router.get("/properties/{property_id}")
@require_permission("properties", "read")
async def get_property(
    property_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    # Scope check also applied
    ...
```

**Backend — Middleware-free, per-route injection:**
- `get_current_user` — Extracts and validates JWT, returns user + permissions.
- `require_permission(module, action)` — Checks permission map; raises 403 if missing.
- `scope_filter(model, user)` — Automatically adds WHERE clause for property-scoped users.

**Frontend — Component-level:**
```tsx
<PermissionGate module="properties" action="create">
  <AddPropertyButton />
</PermissionGate>
```

**Frontend — Route-level:**
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

---

## 7. Module Relationships

### 7.1 Module Dependency Graph

```
                  ┌──────────────┐
                  │   Dashboard  │ (aggregates from all modules)
                  └──────┬───────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│Properties│◄───►│    Units     │◄───►│   Tenants    │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘
     │                 │                    │
     │                 ▼                    │
     │          ┌──────────────┐            │
     │          │    Leases    │◄───────────┤
     │          └──────┬───────┘            │
     │                 │                    │
     │                 ▼                    │
     │          ┌──────────────┐            │
     ├─────────►│ Maintenance  │◄───────────┤
     │          │   Requests   │            │
     │          └──────┬───────┘            │
     │                 │                    │
     │                 ▼                    │
     │          ┌──────────────┐            │
     │          │    Work      │            │
     ├─────────►│   Orders     │◄───────────┤
     │          └──┬─────┬────┘            │
     │             │     │                  │
     │             ▼     ▼                  │
     │    ┌────────┐ ┌──────────┐          │
     │    │Inventory│ │Scheduling│          │
     │    └────┬───┘ └──────────┘          │
     │         │                           │
     │         ▼                           │
     │    ┌──────────┐                     │
     │    │ Vendors  │◄────────────────────┤
     │    └──────────┘                     │
     │                                     │
     ▼                                     │
┌──────────┐                     ┌─────────┴────────┐
│Equipment │                     │   Documents      │
└──────────┘                     │ (polymorphic to  │
                                 │  all entities)   │
                                 └──────────────────┘
┌──────────────┐    ┌───────────────────┐
│  Employees   │◄──►│     Users         │
└──────────────┘    └───────────────────┘
                         │
                         ▼
                   ┌──────────────┐
                   │ Messaging    │◄──► Notifications
                   └──────────────┘
┌────────────┐    ┌──────────────┐
│  Reports   │◄──►│  Analytics   │
└────────────┘    └──────────────┘
                         │
                         ▼
                   ┌──────────────┐
                   │   AI/Admin   │
                   │ Audit/Settings│
                   └──────────────┘
```

### 7.2 Key Relationships

1. **Properties → Units**: One-to-many. A property has multiple units.
2. **Units → Leases → Tenants**: A unit can have multiple leases over time. A lease links one tenant to one unit for a period.
3. **Tenants → Maintenance Requests → Work Orders**: Tenants submit maintenance requests. Supervisors convert requests to work orders.
4. **Work Orders → Employees**: Many-to-many through `work_order_assignees`. A work order can have multiple assigned technicians.
5. **Work Orders → Inventory Items**: Many-to-many through `work_order_materials`. Tracks materials consumed.
6. **Work Orders → Equipment**: Optional link to equipment used.
7. **Properties/Units/Tenants → Documents**: Polymorphic. Any entity can have documents attached.
8. **Users → Messages → Notifications**: Users send messages (internal). Notifications are system-generated alerts.
9. **Vendors → Inventory Items**: A vendor can be the supplier for inventory items.
10. **Vendors → Work Orders**: Vendors can be contracted for work orders.

---

## 8. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)

| Task | Deliverable |
|---|---|
| Project scaffolding | Full directory structure, package.json, pyproject.toml, docker-compose.yml |
| Database setup | PostgreSQL container, Alembic init, base model with mixins |
| Auth system | Users, roles, permissions tables; JWT service; login/register endpoints |
| Backend core | FastAPI app factory, config, dependencies, middleware (CORS, auth, audit) |
| Frontend shell | Vite + React + TypeScript + Tailwind + shadcn/ui setup, routing, auth flow |
| CI/CD setup | GitHub Actions for lint, test, build |

### Phase 2: Core Property Management (Weeks 3-4)

| Task | Deliverable |
|---|---|
| Properties CRUD | Backend API + frontend pages (list, detail, form) |
| Units CRUD | Backend API + frontend pages |
| Tenants CRUD | Backend API + frontend pages |
| Leases CRUD | Backend API + frontend pages |
| Dashboard | Summary API endpoint + dashboard widgets |

### Phase 3: Maintenance (Weeks 5-6)

| Task | Deliverable |
|---|---|
| Maintenance requests | Full lifecycle API + frontend |
| Work orders | Full lifecycle API + frontend |
| Scheduling | Calendar view + scheduling API |
| Photo/video upload | File upload with storage abstraction |

### Phase 4: Operations (Weeks 7-8)

| Task | Deliverable |
|---|---|
| Inventory management | CRUD + low stock alerts + barcode/QR support |
| Equipment management | CRUD + maintenance history tracking |
| Vendor management | CRUD + contracts |
| Employee management | CRUD + role assignment UI |

### Phase 5: Communication (Weeks 9-10)

| Task | Deliverable |
|---|---|
| Messaging system | Backend + frontend inbox |
| Notifications | In-app + email notifications |
| Documents | Upload, versioning, search, permissions |

### Phase 6: Intelligence & Admin (Weeks 11-12)

| Task | Deliverable |
|---|---|
| Reporting engine | Report builder + generation |
| Analytics | Data aggregation endpoints + charts |
| AI assistant | Provider abstraction + chat UI |
| Admin panel | User/role management, system settings, audit log viewer |

### Phase 7: Polish & Production (Weeks 13-14)

| Task | Deliverable |
|---|---|
| 2FA implementation | TOTP setup and verification |
| Rate limiting | Redis-based rate limiter |
| Security audit | Penetration testing, dependency audit |
| Performance optimization | Query optimization, caching, lazy loading |
| Documentation | Markdown docs for all modules |
| Deployment scripts | Docker Compose production config, Proxmox setup |
| E2E tests | Playwright test suite |

---

## 9. Risks

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Scope creep** | Delayed timeline | High | Strict phased roadmap; feature freeze per phase |
| **Database performance** | Slow queries at scale | Medium | Early indexing strategy; query plan reviews; JSONB limits; pagination required on all list endpoints |
| **File storage migration** | Data loss / downtime | Low | Storage abstraction from day one; local FS and S3 use same interface |
| **AI provider lock-in** | Vendor dependency | Medium | Provider pattern with interface; swappable config |
| **Permission complexity** | Security holes | High | Unit-tested permission registry; integration tests for every role × endpoint combination |
| **Mobile responsiveness** | Poor UX on phones | Medium | Mobile-first design; responsive Tailwind grids; touch-friendly controls |
| **Data migration** | Data loss | Low | Alembic with reversible migrations; seed data scripts; backup automation |
| **Third-party API failures** | Degraded experience | Medium | Graceful degradation; timeout handling; retry with backoff |
| **Browser compatibility** | Visual/functional bugs | Low | Modern browser target (Chromium, Firefox, Safari); Playwright cross-browser testing |
| **On-premise deployment complexity** | Support burden | Medium | Docker Compose first; comprehensive deployment docs; health check endpoints |

---

## 10. Testing Strategy

### 10.1 Test Levels

| Level | Tool | Scope | Who Writes | Run Frequency |
|---|---|---|---|---|
| **Unit** | pytest, vitest | Individual functions, services, hooks | Developer | On every commit |
| **Integration** | pytest + httpx, vitest + MSW | API endpoints, database interactions, component interaction | Developer | On every PR |
| **E2E** | Playwright | Full user workflows across frontend + backend | Developer + QA | On staging deploy / release |

### 10.2 Backend Testing

**Framework:** pytest with:
- `pytest-asyncio` for async tests
- `httpx` + `AsyncClient` for FastAPI integration tests
- `pytest-cov` for coverage reporting
- `factory-boy` for test data generation

**Structure:**
```
tests/
├── conftest.py          # App fixture, test DB, test client, auth fixtures
├── factories.py         # All factory_boy factories
├── unit/
│   ├── test_auth_service.py
│   ├── test_permissions.py
│   └── ...
├── integration/
│   ├── test_auth_api.py
│   ├── test_properties_api.py
│   └── ...
└── e2e/
    ├── test_property_lifecycle.py
    └── test_tenant_lifecycle.py
```

**Key fixtures in conftest.py:**
- `test_db` — Creates a fresh database for each test session (or transaction rollback per test)
- `async_client` — FastAPI TestClient with httpx.AsyncClient
- `auth_headers` — Generates JWT for a given role
- `seed_property`, `seed_tenant`, etc.

**Coverage threshold:** Minimum 85% overall, 100% for permission/security logic.

### 10.3 Frontend Testing

**Framework:** vitest + React Testing Library

**Structure:**
```
src/__tests__/
├── components/
├── hooks/
├── pages/
├── api/
└── utils/
```

**Key patterns:**
- Component tests render with mocked API data (MSW handlers)
- Hook tests with renderHook
- No testing of shadcn/ui primitives (assumed stable)
- Test user interactions, not implementation details

### 10.4 End-to-End Testing

**Framework:** Playwright

**Test scenarios:**
- User registration and login flow
- Create property → add unit → add tenant → create lease
- Submit maintenance request → create work order → assign → complete
- File upload and document management
- Permission enforcement (tenant user tries admin endpoint)
- Dark mode toggle, responsive layout

**CI Integration:**
```yaml
# GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_DB: companyos_test
        POSTGRES_PASSWORD: testpass
  steps:
    - uses: actions/checkout@v4
    - name: Run backend tests
      run: pytest --cov=app --cov-fail-under=85
    - name: Run frontend tests
      run: npm test
    - name: Run E2E tests
      run: npx playwright test
```

### 10.5 Security Testing

- Automated dependency scanning (`pip audit`, `npm audit`)
- Permission matrix tests (every role × every endpoint)
- SQL injection tests on all filter parameters
- XSS checks on rich text fields
- File upload validation tests (type, size, path traversal)

### 10.6 Performance Testing

- Query plan analysis on all list endpoints
- Load testing with locust.io for concurrent user simulation
- Frontend bundle size monitoring with `vite-bundle-visualizer`
- Lighthouse CI for frontend performance metrics

---

## Appendix A: Technology Versions

| Technology | Version |
|---|---|
| Python | 3.12 |
| Node.js | 22 LTS |
| PostgreSQL | 16 |
| Redis | 7 |
| FastAPI | 0.115+ |
| SQLAlchemy | 2.0+ |
| React | 18.3+ |
| TypeScript | 5.6+ |
| Vite | 6+ |
| Tailwind CSS | 4+ |
| Playwright | 1.50+ |

## Appendix B: Coding Standards Summary

### Python
- Type hints everywhere (strict mypy)
- Black formatter (88 chars)
- Ruff linter
- No wildcard imports
- Services receive dependencies via constructor injection
- Repositories extend `BaseRepository`

### TypeScript/React
- Strict TypeScript mode
- Prettier + ESLint
- Named exports preferred
- Custom hooks for reusable stateful logic
- TanStack Query for server state, Zustand for client state
- Component per file
- `cn()` utility for className merging

### Database
- All tables have `id` (UUID), `created_at`, `updated_at`, `deleted_at`
- Foreign keys are UUIDs
- Soft deletes with `deleted_at` filter on all queries
- Migrations are reviewed and squashed before merge to main

---

## Appendix C: Key Design Decisions

1. **UUID over auto-increment IDs** — Prevents enumeration attacks, supports distributed systems, merge-friendly.
2. **Soft deletes** — Audit trail and recoverability. All queries filter `WHERE deleted_at IS NULL` via a SQLAlchemy query filter.
3. **JSONB for permissions** — Flexible role definition without schema changes. Validated at write time against a permission schema.
4. **Provider pattern for AI/Storage** — Config changes without code changes. New providers implement an interface.
5. **Property scoping** — Users with property-scoped roles (Property Manager, Tenant) see only their data. Enforced at the repository/query level.
6. **Alembic for migrations** — Auto-generation from model changes. Reviewed manually before commit.
7. **Separate API versioning** — `/api/v1/` prefix allows parallel API versions during migration.
8. **Repository pattern** — Abstracts DB behind interface. Enables unit testing with mock repositories.
9. **Zustand for client state** — Lightweight, TypeScript-first, no boilerplate. TanStack Query handles server state exclusively.
10. **Feature-based frontend folder structure** — Co-locates pages, components, and feature-specific logic. Keeps the app modular.
