# NMG Marine Service - Complete Role-Based PMS & CRM System

## System Overview

A comprehensive, high-fidelity SaaS CRM + PMS (Planned Maintenance System) for marine shipping companies, deployed across **7 ships** with full **role-based access control** and centralized master control.

---

## User Roles & Access

### 1. MASTER (Super Admin - Full Access)

**Complete Control Over:**
- All 7 ships with multi-ship navigation
- All crew, staff, and system users
- PMS task approval workflows
- Crew daily log approvals
- Invoice approvals
- Global reports & analytics
- Role & access control management
- Audit trail & activity tracking

**Master Dashboard Features:**
- Fleet overview with KPIs for all 7 ships
- Ship selector in top bar (switch between ships)
- Pending approvals dashboard (PMS, Logs, Invoices)
- Multi-ship analytics and reporting
- System-wide settings & configurations

---

### 2. CREW (Limited Access - Onboard Users)

**Task-Focused UI - Mobile-Friendly:**
- Login specific to assigned ship only
- Submit daily work logs with photo uploads
- Update PMS task status (Started/In Progress/Completed)
- Upload maintenance photos & proof
- View assigned tasks & maintenance schedules
- View notices from Master
- Basic document access

**Crew Dashboard Features:**
- My Tasks Today (quick access to pending tasks)
- Ship-specific information only
- Simple, form-based interfaces
- Mobile-optimized workflows

**Crew CANNOT:**
- View other ships
- Edit invoices or financial data
- Approve any workflows
- Access system settings or user management

---

### 3. STAFF (Shore/Office Users - Operations)

**Data-Heavy Operations Access:**
- Crew onboarding & management
- Assign crew to ships
- Invoice creation & management
- PMS oversight & scheduling
- Generate operational reports
- Expense tracking per ship
- View all ships & crew data

**Staff Dashboard Features:**
- Operations overview across all ships
- Crew workflow tracking
- Invoice submission & tracking
- Expense management
- Report generation

**Staff CANNOT:**
- Approve final actions (PMS, Logs, Invoices)
- Modify system roles or permissions
- Access master-level settings
- Delete critical records

---

## Core Modules

### 1. Master Dashboard
**All Roles - Customized by Role**

**Master View:**
- Total Ships: 7 (with status indicators)
- Active Vessels
- Total Crew across fleet
- Pending PMS Tasks (all ships)
- Pending Approvals count
- Quick action cards for approvals
- Ship selector dropdown

**Crew View:**
- Assigned ship information
- My Tasks Today
- Completed tasks count
- Overdue tasks alert
- Quick task actions

**Staff View:**
- Operations overview
- All ships status
- Crew management summary
- Invoice tracking

---

### 2. PMS - Planned Maintenance System
**Full Workflow Management**

**Features:**
- Equipment registry per ship
- Maintenance schedules (Daily/Weekly/Monthly)
- Task status tracking:
  - Pending
  - In Progress
  - Completed
  - Overdue
- Task assignment to crew
- Photo upload for proof
- Remarks & observations
- Master approval workflow
- Maintenance history timeline
- Equipment-wise task tracking

**Task Lifecycle:**
1. Task created/scheduled (Master/Staff)
2. Assigned to crew member
3. Crew updates status & uploads proof
4. Submitted for approval
5. Master approves/rejects
6. Logged in maintenance history

**KPI Cards:**
- Pending Tasks
- In Progress Tasks
- Completed Tasks
- Overdue Tasks
- Awaiting Approval (Master only)

---

### 3. Crew Daily Work Module
**Daily Log Submission & Approval**

**Features:**
- Date-based log entries
- Task type categorization:
  - Engine Maintenance
  - Deck Work
  - Safety Inspection
  - Cleaning
  - Repair Work
  - Inventory Check
  - Other
- Detailed description field
- Hours worked tracking
- Photo uploads (optional)
- Status workflow:
  - Pending
  - Approved
  - Rejected

**Crew Interface:**
- Simple log submission form
- View own submitted logs
- Track approval status
- View feedback/rejection reasons

**Master Interface:**
- Review panel for pending logs
- Approve/Reject actions
- View all crew logs across ships
- Filter by ship/crew/date
- Audit trail of approvals

---

### 4. Invoice Management
**Staff Operations - Master Approval**

**Features:**
- Invoice creation with details:
  - Invoice number
  - Ship assignment
  - Vendor information
  - Category (Fuel, Maintenance, Provisions, Port Fees, etc.)
  - Amount & currency
  - Due dates
- File attachment support (PDF/images)
- Status workflow:
  - Draft
  - Submitted
  - Approved
  - Paid
  - Rejected
- Ship-wise expense tracking
- Multi-currency support

**Staff Workflow:**
1. Create invoice
2. Submit for approval
3. Track approval status
4. Mark as paid after approval

**Master Workflow:**
1. Review submitted invoices
2. Approve/Reject with reasons
3. Track payment status
4. View financial reports

**KPI Dashboard:**
- Total Amount
- Pending Amount
- Paid Amount
- Awaiting Approval Count

---

### 5. Role & Access Control
**Master-Only Module**

**Features:**
- User management:
  - Create/Edit/Delete users
  - Assign roles (Master/Crew/Staff)
  - Ship-based access assignment
  - Active/Inactive status
- Permissions matrix:
  - Module-wise access control
  - Role-based permission visualization
  - Read/Write/Approve permissions
- Audit trail:
  - Activity logging
  - User action tracking
  - IP address logging
  - Timestamp records

**Role Descriptions:**
- Master: Full system access
- Crew: Limited, task-focused access
- Staff: Operations access without approvals

**Audit Features:**
- Who did what, when
- Action type tracking
- Target entity logging
- IP address recording

---

### 6. Enhanced Dashboard (Role-Specific)

**Master Dashboard:**
- Fleet overview (7 ships)
- Ship selector in top bar
- Pending approvals summary
- Multi-ship KPIs
- Quick action cards
- Recent activity feed

**Crew Dashboard:**
- My Tasks Today
- Ship information
- Task completion status
- Document expiry alerts
- Simple task actions

**Staff Dashboard:**
- Operations overview
- Crew management summary
- Invoice tracking
- All ships status
- Report access

---

## Design System

### Color Palette
- **Primary:** Navy Blue (#053B5E)
- **Accent:** Sea Green (#1ABC9C)
- **Background:** Light Gray (#F5F7FA)
- **Card:** White (#FFFFFF)
- **Success:** Green (#27AE60)
- **Warning:** Yellow (#F1C40F)
- **Error:** Red (#E74C3C)

### Status Colors
- **Approved/Active:** Green
- **Pending:** Yellow
- **Overdue/Rejected:** Red
- **In Progress:** Blue
- **Draft:** Gray

### Typography
- **Font Family:** Inter (system default)
- **Headings:** Semibold
- **Body:** Regular
- **Labels:** Medium

### Components
- **Cards:** Shadow-lg, rounded corners
- **Buttons:** Accent color primary, outlined secondary
- **Badges:** Color-coded by status
- **Tables:** Data-dense with filters
- **Forms:** Clear labels, validation

---

## Navigation Structure

### Master Navigation
- Dashboard (Fleet overview)
- PMS (All ships)
- Daily Work Logs (Review & approve)
- Masters Data
- Clients
- Vessels
- Crew Management
- Recruitment
- Documents
- DG Communication
- Invoices (Approve)
- Finance
- Reports
- Access Control
- Settings

### Crew Navigation
- Dashboard (My tasks)
- PMS (My tasks)
- Daily Work Logs (Submit)
- Documents
- Settings

### Staff Navigation
- Dashboard
- PMS (Oversight)
- Masters Data
- Clients
- Vessels
- Crew Management
- Recruitment
- Documents
- DG Communication
- Invoices (Create & manage)
- Finance
- Reports
- Settings

---

## Key Features

### Multi-Ship Management
- 7 ships in fleet:
  1. MV Ocean Star (Bulk Carrier) - Active
  2. MT Pacific Wave (Oil Tanker) - Active
  3. MV Atlantic Trader (Container Ship) - Active
  4. MT Indian Star (Chemical Tanker) - Maintenance
  5. MV Arctic Explorer (Bulk Carrier) - Active
  6. MT Mediterranean (Oil Tanker) - Docked
  7. MV Global Trader (Container Ship) - Active

### Approval Workflows
1. **PMS Tasks:** Crew → Master
2. **Daily Logs:** Crew → Master
3. **Invoices:** Staff → Master

### Mobile-Friendly
- Crew interface optimized for mobile
- Touch-friendly forms
- Photo upload from mobile
- Responsive tables
- Collapsible navigation

### Data Security
- Role-based access control
- Ship-based data isolation (Crew)
- Audit logging
- Permission matrix
- User activity tracking

---

## User Experience

### Master UX
- **Power User Interface:** Data-dense tables, multiple filters, batch actions
- **Multi-Ship View:** Switch ships via top bar dropdown
- **Approval Center:** Dedicated sections for pending approvals
- **Analytics:** Fleet-wide reports and KPIs

### Crew UX
- **Simple & Task-Focused:** Minimal navigation, clear CTAs
- **Mobile-First:** Touch-optimized, photo capture, offline-ready forms
- **Limited Scope:** Only see assigned ship and tasks
- **Quick Actions:** One-tap task updates

### Staff UX
- **Operations Dashboard:** Workflow-driven, data tables
- **Multi-Ship Access:** View all ships, manage crew assignments
- **Invoice Workflows:** Create, submit, track invoices
- **Report Generation:** Export data, generate reports

---

## Technical Implementation

### Frontend Stack
- **React:** Component-based UI
- **TypeScript:** Type-safe code
- **Tailwind CSS:** Utility-first styling
- **shadcn/ui:** Component library
- **Recharts:** Data visualization
- **React Context:** Global state management

### Key Libraries
- **lucide-react:** Icons
- **sonner:** Toast notifications
- **recharts:** Charts and graphs
- **react-hook-form:** Form handling

### State Management
- **AuthContext:** User authentication & role management
- **Ship Selection:** Master ship switching
- **Local State:** Page-level state with hooks

---

## Demo Login Credentials

### Master (Super Admin)
- **Role:** Master
- **Access:** All 7 ships, all features
- **Demo User:** Captain Anderson

### Crew (Limited Access)
- **Role:** Crew
- **Access:** Single ship assignment
- **Demo User:** John Smith (MV Ocean Star)

### Staff (Operations)
- **Role:** Staff
- **Access:** All ships, operations only
- **Demo User:** Sarah Johnson

---

## Future Enhancements

1. **Real-time Notifications:** WebSocket integration
2. **Offline Mode:** Service workers for crew mobile app
3. **Advanced Analytics:** Predictive maintenance, cost forecasting
4. **Mobile Apps:** Native iOS/Android for crew
5. **Integration:** Third-party systems (accounting, HR)
6. **Document OCR:** Auto-extract invoice data
7. **Multi-language:** I18n support
8. **Advanced Reporting:** Custom report builder

---

## Conclusion

This system provides a complete, enterprise-grade solution for marine fleet management with clear role separation, robust workflows, and a professional, high-fidelity UI. The role-based architecture ensures that each user type (Master, Crew, Staff) has exactly the access and interface they need to perform their duties efficiently.
