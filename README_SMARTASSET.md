# SmartAsset AI - Intelligent Asset Lifecycle, Audit, and Risk Management Platform

A comprehensive enterprise asset management platform designed for banking institutions, featuring intelligent lifecycle tracking, audit trails, risk assessment, and predictive analytics.

## Features

### Core Functionality
- **Asset Registration & Management**: Complete lifecycle tracking from registration to write-off
- **Intelligent Assignment**: Assign assets to employees, departments, or branches with full history
- **Status Tracking**: Monitor asset states (REGISTERED, ASSIGNED, IN_REPAIR, LOST, WRITTEN_OFF)
- **QR Code Generation**: Unique QR codes for each asset for easy scanning and identification
- **Image Upload**: Automatic compression and storage of asset images

### Intelligence Modules
- **Health Score Calculation**: AI-powered health assessment based on age, repairs, and usage patterns
- **Risk Score Analysis**: Predictive risk scoring to identify problematic assets
- **Aging Asset Detection**: Automatic flagging of assets requiring replacement
- **Suspicious Activity Detection**: Anomaly detection for unusual asset patterns
- **Replacement Recommendations**: Smart suggestions for asset replacement

### Audit & Compliance
- **Complete Audit Trail**: Immutable logs of all actions and changes
- **Assignment History**: Track all asset assignments and returns
- **Status History**: Timeline of all status changes
- **User Activity Tracking**: Monitor who performed what actions and when

### Analytics & Reporting
- **Dashboard Overview**: Real-time statistics and visualizations
- **Status Distribution**: Charts showing asset distribution by status and category
- **Risk Alerts**: Immediate notifications for high-risk assets
- **Aging Reports**: Lists of assets approaching end-of-life

### User Roles & Permissions
- **Admin**: Full system access including user management
- **Asset Manager**: Asset management, assignments, and reporting
- **Employee**: View assigned assets and report issues

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** + Zod for form validation
- **Recharts** for data visualization
- **QRCode** for QR code generation

### Backend
- **Supabase** for backend services
- **PostgreSQL** database with Row Level Security
- **Supabase Auth** for authentication
- **Supabase Storage** for image uploads

## Database Schema

### Tables
1. **profiles** - User profiles with roles
2. **employees** - Employee records for asset assignment
3. **assets** - Asset inventory with full details
4. **asset_assignment_history** - Track all assignments
5. **asset_status_history** - Track all status changes
6. **audit_logs** - Complete audit trail

### Enums
- `user_role`: employee, asset_manager, admin
- `asset_status`: REGISTERED, ASSIGNED, IN_REPAIR, LOST, WRITTEN_OFF
- `asset_category`: IT, OFFICE, SECURITY, NETWORK, OTHER
- `audit_action_type`: CREATE, UPDATE, DELETE, ASSIGN, RETURN, STATUS_CHANGE, REPAIR, VERIFY
- `owner_type`: employee, department, branch

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project

### Quick Start

1. **Clone and Install**
```bash
pnpm install
```

2. **Configure Environment Variables** (REQUIRED)
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Get these from: https://app.supabase.com/project/_/settings/api
```

Your `.env` file should look like:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Set up Supabase Database**
   - Create a new Supabase project at https://supabase.com
   - Run the migration SQL (see SETUP_GUIDE.md for complete SQL)
   - Create storage bucket: `app-aat6qq6efrpd_assets_images`
   - Disable email confirmation in Auth settings

4. **Start Development Server**
```bash
pnpm dev
```

5. **First User Setup**
   - Register a new account
   - First user automatically becomes admin
   - Access Admin panel to manage other users

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the migration SQL from the requirements document to create tables
   - Create a storage bucket named `app-aat6qq6efrpd_assets_images`
   - Set bucket policies to allow authenticated users to upload
   - Optionally run the seed data SQL

3. Configure environment variables with your Supabase credentials

4. Start the development server:
```bash
pnpm dev
```

### First User Setup
- The first user to register will automatically become an admin
- Subsequent users will be assigned the "employee" role by default
- Admins can change user roles through the Admin panel

## Usage Guide

### Getting Started
1. **Register**: Create an account (first user becomes admin)
2. **Add Employees**: Navigate to Employees page and add employee records
3. **Register Assets**: Go to Assets page and create new assets
4. **Assign Assets**: Click on an asset and use the "Assign Asset" button
5. **Track Status**: Update asset status as needed (In Repair, Lost, etc.)
6. **Monitor Dashboard**: View analytics and alerts on the Dashboard

### Asset Management Workflow
1. **Registration**: Create asset with details and image
2. **Assignment**: Assign to employee with reason
3. **Tracking**: Monitor health and risk scores
4. **Maintenance**: Update status when repairs needed
5. **Verification**: Regularly verify asset condition
6. **Retirement**: Mark as WRITTEN_OFF when end-of-life

### Intelligence Features
- **Health Score**: 0-100 scale (80-100: Healthy, 50-79: Warning, 0-49: Critical)
- **Risk Score**: 0-100 scale (0-30: Low, 31-60: Medium, 61-100: High)
- **Aging Detection**: Flags assets >3 years old with health <60 and repairs ≥2
- **Suspicious Patterns**: Detects anomalies like missing owners, unusual transfers

## Key Features Demonstration

### Dashboard
- Total assets count
- Aging assets alert
- High-risk assets warning
- Suspicious activity notifications
- Status and category distribution charts

### Asset Detail Page
- Complete asset information
- QR code for scanning
- Health and risk scores
- Assignment history timeline
- Status change history
- Complete audit trail
- Quick actions (Assign, Return, Change Status, Verify)

### Admin Panel
- User management
- Role assignment
- Permission control

## Security Features
- Row Level Security (RLS) on all tables
- Role-based access control
- Immutable audit logs
- Secure image upload with compression
- Protected API endpoints

## Business Rules
- LOST assets cannot be reassigned
- WRITTEN_OFF is a terminal status
- IN_REPAIR assets must complete repair before assignment
- All status changes require a reason
- Assets can only have one active owner
- Previous assignments must be closed before new assignments

## Intelligence Algorithms

### Health Score Formula
```
Score = 100
  - (age_years × 8)
  - (repair_count × 12)
  - (owner_change_count × 4)
  - (audit_issue_count × 10)
  - (days_since_verification / 30 × 3)
  - status_penalties
```

### Risk Score Formula
```
Score = age_factor + repair_factor + instability_factor
  + audit_factor + comment_issue_factor
  + missing_verification_factor
```

## License
© 2026 SmartAsset AI. All rights reserved.
