# SmartAsset AI - Project Structure

## Directory Structure

```
/workspace/app-aat6qq6efrpd/
├── src/
│   ├── components/
│   │   ├── assets/
│   │   │   ├── ImageUpload.tsx          # Image upload with compression
│   │   │   └── StatusBadge.tsx          # Asset status badge component
│   │   ├── common/
│   │   │   ├── IntersectObserver.tsx    # Intersection observer utility
│   │   │   ├── PageMeta.tsx             # Page metadata component
│   │   │   └── RouteGuard.tsx           # Authentication route guard
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx            # Main application layout with sidebar
│   │   └── ui/                          # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context provider
│   ├── db/
│   │   ├── api.ts                       # Database API layer with all CRUD operations
│   │   └── supabase.ts                  # Supabase client initialization
│   ├── hooks/
│   │   ├── use-debounce.ts              # Debounce hook
│   │   ├── use-go-back.ts               # Navigation hook
│   │   ├── use-mobile.tsx               # Mobile detection hook
│   │   └── use-supabase-upload.ts       # Supabase upload hook
│   ├── pages/
│   │   ├── Admin.tsx                    # Admin panel for user management
│   │   ├── AssetDetail.tsx              # Detailed asset view with QR, scores, history
│   │   ├── Assets.tsx                   # Asset list with search and filters
│   │   ├── Dashboard.tsx                # Dashboard with analytics and charts
│   │   ├── Employees.tsx                # Employee management page
│   │   ├── Login.tsx                    # Login and registration page
│   │   └── NotFound.tsx                 # 404 page
│   ├── types/
│   │   ├── index.ts                     # Type exports
│   │   └── types.ts                     # All TypeScript type definitions
│   ├── App.tsx                          # Main application component
│   ├── index.css                        # Global styles and design tokens
│   ├── main.tsx                         # Application entry point
│   └── routes.tsx                       # Route configuration
├── supabase/
│   ├── config.toml                      # Supabase configuration
│   └── seed.sql                         # Seed data SQL
├── public/                              # Static assets
├── README_SMARTASSET.md                 # Project documentation
├── SETUP_GUIDE.md                       # Complete setup instructions
├── TODO.md                              # Project progress tracker
├── package.json                         # Dependencies and scripts
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── vite.config.ts                       # Vite configuration
```

## Key Files Explained

### Core Application Files

**src/App.tsx**

- Main application component
- Sets up routing with React Router
- Wraps app with AuthProvider and RouteGuard
- Applies AppLayout to authenticated pages

**src/routes.tsx**

- Defines all application routes
- Maps paths to page components
- Controls route visibility in navigation

**src/main.tsx**

- Application entry point
- Renders the React app
- Mounts to DOM

### Authentication & Security

**src/contexts/AuthContext.tsx**

- Manages authentication state
- Provides login/logout functions
- Handles user profile data
- Username-based authentication using corporate email domains

**src/components/common/RouteGuard.tsx**

- Protects authenticated routes
- Redirects unauthenticated users to login
- Shows loading state during auth check

### Database & API

**src/db/supabase.ts**

- Initializes Supabase client
- Exports configured client for use throughout app

**src/db/api.ts** (1000+ lines)

- Complete API layer for all database operations
- CRUD operations for all entities
- Intelligence calculation functions:
  - `calculateAssetHealthScore()` - Health score algorithm
  - `calculateAssetRiskScore()` - Risk score algorithm
  - `calculateAssetIntelligence()` - Combined intelligence
  - `getAgingAssets()` - Aging asset detection
  - `getRiskyAssets()` - High-risk asset detection
  - `getSuspiciousAssets()` - Anomaly detection
- Asset management functions:
  - `createAsset()`, `updateAsset()`, `assignAsset()`, `returnAsset()`
  - `changeAssetStatus()`, `verifyAsset()`
- Employee management functions
- Profile management functions
- Audit log creation and retrieval
- Dashboard statistics aggregation

### Type Definitions

**src/types/types.ts**

- All TypeScript interfaces and types
- Enums for status, category, roles, etc.
- Form input types
- Intelligence score types
- Database entity types

### Pages

**src/pages/Dashboard.tsx**

- Overview statistics cards
- Status and category distribution charts
- Aging, risky, and suspicious asset alerts
- Recent activity list
- Uses Recharts for visualizations

**src/pages/Assets.tsx**

- Asset list table with pagination
- Search and filter functionality
- Create new asset dialog with form
- Image upload integration
- Status and category badges

**src/pages/AssetDetail.tsx**

- Complete asset information display
- QR code generation and display
- Health and risk score cards
- Assignment, status, and audit history tabs
- Quick action buttons (Assign, Return, Change Status, Verify)
- Suspicious activity alerts

**src/pages/Employees.tsx**

- Employee list table
- Search functionality
- Create new employee dialog
- Employee information display

**src/pages/Admin.tsx**

- User management table
- Role assignment functionality
- User profile display
- Role descriptions and permissions

**src/pages/Login.tsx**

- Login and registration tabs
- Username/password authentication
- Form validation
- Auto-redirect after login

### Components

**src/components/layouts/AppLayout.tsx**

- Responsive sidebar navigation
- Desktop and mobile layouts
- User profile dropdown
- Role-based navigation (Admin link for admins only)
- Mobile hamburger menu with Sheet component

**src/components/assets/StatusBadge.tsx**

- Displays asset status with color coding
- Maps status to badge variants

**src/components/assets/ImageUpload.tsx**

- Drag-and-drop image upload
- Automatic image compression
- Preview functionality
- Progress indicator
- Supabase Storage integration

### Styling

**src/index.css**

- CSS custom properties for design tokens
- Blue and teal color scheme for banking
- Light and dark mode support
- Semantic color naming (primary, secondary, accent, etc.)

**tailwind.config.js**

- Tailwind CSS configuration
- Custom color mappings
- Plugin configuration
- Container queries setup

## Database Schema

### Tables

1. **profiles**
   - User authentication profiles
   - Role assignment (employee, asset_manager, admin)
   - Personal information

2. **employees**
   - Employee records for asset assignment
   - Department and branch information
   - Contact details

3. **assets**
   - Complete asset inventory
   - Status tracking
   - Owner assignment
   - QR code data
   - Image URLs

4. **asset_assignment_history**
   - Track all asset assignments
   - Assignment and return timestamps
   - Reason logging
   - Assigned by tracking

5. **asset_status_history**
   - Track all status changes
   - Previous and new status
   - Change reason
   - Changed by tracking

6. **audit_logs**
   - Immutable audit trail
   - All entity changes
   - User actions
   - Previous and new states

### Key Functions

- `is_admin(uid)` - Check if user is admin
- `is_manager_or_admin(uid)` - Check if user has management permissions
- `handle_new_user()` - Auto-create profile on user registration

### RLS Policies

- Admins have full access to all tables
- Managers can manage assets, employees, and view audit logs
- Employees can view assets and their own profile
- All authenticated users can view employees and assets
- Audit logs are read-only for managers/admins

## Intelligence Algorithms

### Health Score (0-100)

```
Score = 100
  - (age_years × 8)
  - (repair_count × 12)
  - (owner_change_count × 4)
  - (audit_issue_count × 10)
  - (days_since_verification / 30 × 3)
  - status_penalties (IN_REPAIR: -20, LOST: -50, WRITTEN_OFF: -100)

Levels:
- 80-100: Healthy
- 50-79: Warning
- 0-49: Critical
```

### Risk Score (0-100)

```
Score = age_factor + repair_factor + instability_factor
  + audit_factor + comment_issue_factor + missing_verification_factor

Factors:
- age_factor: 20 if >5 years, 10 if >3 years, else 0
- repair_factor: 25 if ≥3 repairs, 15 if 2, 5 if 1, else 0
- instability_factor: 15 if ≥4 owner changes, 8 if ≥2, else 0
- audit_factor: 20 if ≥2 issues, 10 if 1, else 0
- comment_issue_factor: 10 if repeated issue keywords
- missing_verification_factor: 10 if not verified in 180 days

Levels:
- 0-30: Low
- 31-60: Medium
- 61-100: High
```

### Aging Detection

Flags assets as aging if:

- Purchase date > 3 years ago
- Health score < 60
- Repair count ≥ 2

### Suspicious Detection

Flags assets as suspicious if:

- Asset marked ASSIGNED but no active owner
- Asset has multiple active assignments
- Asset marked LOST but later reassigned
- Asset has missing audit trail
- Asset changed owners unusually often (≥3 times in 180 days)
- Asset not verified in 365 days

### Replacement Recommendation

Recommends replacement if:

- Health score < 40
- OR age > 5 years AND repair_count ≥ 3
- OR risk score > 70

## Technology Stack

### Frontend

- React 18.0.0
- TypeScript 5.9.3
- Vite (Rolldown)
- React Router 7.9.5
- Tailwind CSS 3.4.11
- shadcn/ui components
- React Hook Form 7.66.0
- Zod 3.25.76
- Recharts 2.15.4
- QRCode 1.5.4
- React Dropzone 14.3.8

### Backend

- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

### Development Tools

- Biome 2.4.5 (linting)
- TypeScript compiler
- PostCSS
- Autoprefixer

## Key Features

### Asset Management

- ✅ Create, read, update assets
- ✅ Assign to employees/departments/branches
- ✅ Track status changes
- ✅ Upload and store images
- ✅ Generate QR codes
- ✅ Verify assets

### Intelligence

- ✅ Health score calculation
- ✅ Risk score calculation
- ✅ Aging asset detection
- ✅ Suspicious activity detection
- ✅ Replacement recommendations

### Audit & Compliance

- ✅ Complete audit trail
- ✅ Assignment history
- ✅ Status history
- ✅ Immutable logs
- ✅ User action tracking

### Analytics

- ✅ Dashboard with charts
- ✅ Status distribution
- ✅ Category distribution
- ✅ Risk alerts
- ✅ Aging reports

### User Management

- ✅ Role-based access control
- ✅ Admin panel
- ✅ User profile management
- ✅ First user auto-admin

## Business Rules

1. **Status Transitions**
   - LOST assets cannot be reassigned
   - WRITTEN_OFF is terminal (no further transitions)
   - IN_REPAIR assets must complete repair before assignment

2. **Assignment Rules**
   - Asset can only have one active owner
   - Previous assignment must be closed before new assignment
   - All assignments require a reason

3. **Audit Rules**
   - All state changes create audit log entry
   - Audit logs are immutable
   - Audit entries include user and timestamp

4. **Access Control**
   - Admins: Full system access
   - Asset Managers: Asset management and reporting
   - Employees: View assets and own profile

## Performance Considerations

- Cursor-based pagination for large datasets
- Indexed database queries
- Image compression before upload
- Lazy loading of intelligence calculations
- Efficient RLS policies
- Optimized chart rendering

## Security Features

- Row Level Security on all tables
- Role-based access control
- Secure authentication
- Immutable audit logs
- Protected API endpoints
- Image upload validation
- XSS protection
- CSRF protection

## Future Enhancements

Potential features for future versions:

- Export reports to PDF/Excel
- Email notifications for alerts
- Mobile app for QR scanning
- Bulk asset operations
- Advanced analytics dashboard
- Predictive maintenance scheduling
- Integration with procurement systems
- Asset depreciation tracking
- Maintenance schedule management
- Vendor management
