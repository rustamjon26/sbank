# SmartAsset AI — Intelligent Lifecycle, Audit, and Risk Management Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
SmartAsset AI — Intelligent Lifecycle, Audit, and Risk Management Platform for Bank Office Assets

### 1.2 Application Description
A full-stack Smart Banking / Smart Office platform that centrally manages all office and IT assets in a bank, including their lifecycle, ownership, status transitions, audit history, QR-based tracking, analytics, and intelligent risk insights.

### 1.3 Application Type
Web-based enterprise asset management platform

## 2. Domain Context and Problem Statement

Banks manage numerous assets including laptops, printers, terminals, monitors, routers, security devices, and office equipment. Current challenges include:
- Unclear ownership tracking
- Missing lifecycle management
- Poor audit visibility
- Manual inventory processes
- Lack of predictive insight for damaged or aging assets

## 3. Core Functional Requirements

### 3.1 Asset Registration
- Create new assets with the following fields:
  - Asset name
  - Asset type
  - Category
  - Serial number
  - Image upload
  - Purchase date
  - Branch assignment
  - Department assignment

### 3.2 Asset Categories
Support the following asset categories:
- IT (laptops, computers, tablets)
- OFFICE (desks, chairs, printers)
- SECURITY (cameras, access control devices)
- NETWORK (routers, switches, servers)
- OTHER (miscellaneous equipment)

### 3.3 Lifecycle Management
Asset status tracking with the following states:
- REGISTERED (newly added to system)
- ASSIGNED (allocated to employee/department/branch)
- IN_REPAIR (undergoing maintenance)
- LOST (missing or stolen)
- WRITTEN_OFF (permanently removed from inventory)

### 3.4 Status Business Rules
- LOST assets cannot be reassigned for active use
- WRITTEN_OFF is a terminal status with no further transitions
- IN_REPAIR assets cannot be actively assigned until repair is complete
- Status transitions must be logged with timestamp and user information

### 3.5 Ownership and Assignment
- Assets can be assigned to:
  - Individual employees
  - Departments
  - Branch locations
- Each asset can have only one active owner at a time
- Return action must update ownership records and asset status
- Assignment history must be maintained

### 3.6 Audit and History Tracking
- Full action history per asset including:
  - Who performed the action
  - What was changed
  - When the change occurred
  - Why the change was made (reason/comment)
- Audit logs must be immutable
- Complete audit trail for compliance purposes

### 3.7 QR-Based Tracking
- Generate unique QR code for each asset
- QR code scanning opens asset passport/detail page
- QR codes should be printable for physical labeling

### 3.8 Search and Analytics
- Search functionality by:
  - Serial number
  - Category
  - Owner (employee/department/branch)
  - Status
  - Branch location
- Dashboard features:
  - Asset count summaries
  - Status distribution charts
  - Aging asset reports
  - Category breakdowns

### 3.9 Intelligence Modules

#### 3.9.1 Asset Health Score
Calculate asset health based on:
- Asset age (years)
- Repair count
- Owner change count
- Audit issue count
- Days since last verification
- Current status penalties

Formula:
```
Health Score = 100
  - (asset_age_years * 8)
  - (repair_count * 12)
  - (owner_change_count * 4)
  - (audit_issue_count * 10)
  - (days_since_last_verification / 30 * 3)
  - status penalties:
    IN_REPAIR = -20
    LOST = -50
    WRITTEN_OFF = -100

Clamp between 0 and 100
```

Interpretation:
- 80-100 = Healthy
- 50-79 = Warning
- 0-49 = Critical

#### 3.9.2 Asset Risk Score
Calculate risk level based on:
- Age factor
- Repair factor
- Instability factor (owner changes)
- Audit factor
- Comment issue factor
- Missing verification factor

Formula:
```
Risk Score = 0
  + age_factor
  + repair_factor
  + instability_factor
  + audit_factor
  + comment_issue_factor
  + missing_verification_factor

Where:
age_factor = 20 if age > 5 years else 10 if age > 3 years else 0
repair_factor = 25 if repair_count >= 3 else 15 if repair_count == 2 else 5 if repair_count == 1 else 0
instability_factor = 15 if owner_change_count >= 4 else 8 if owner_change_count >= 2 else 0
audit_factor = 20 if audit_issue_count >= 2 else 10 if audit_issue_count == 1 else 0
comment_issue_factor = 10 if comments contain repeated issue signals
missing_verification_factor = 10 if not verified in last 180 days
```

Risk levels:
- 0-30 = Low
- 31-60 = Medium
- 61-100 = High

#### 3.9.3 Replacement Recommendation Engine
Recommend replacement if:
- Health score < 40
- OR age > 5 years AND repair_count >= 3
- OR same issue repeated >= 2 times in 6 months
- OR risk score > 70

#### 3.9.4 Aging Asset Detector
Flag assets as aging if:
- Purchase date > 3 years ago
- Health score < 60
- Repair count >= 2

#### 3.9.5 Suspicious Asset Detector
Flag suspicious if:
- Asset marked ASSIGNED but no active owner exists
- Asset has multiple active assignments
- Asset is LOST but later reassigned
- Asset has missing audit trail for status changes
- Asset changed owners unusually often in short period
- Asset not verified during active audit cycle

#### 3.9.6 Comment-Based Issue Detection
Analyze comments for keywords:
- broken, damaged, faulty, malfunction, error, problem, issue, defect
- Track frequency and recency of issue mentions

#### 3.9.7 AI-Generated Audit Summary
Generate summary of:
- Total actions performed
- Most frequent action types
- Users with most activity
- Critical status changes
- Anomalies detected

## 4. User Roles

### 4.1 Administrator
- Full system access
- Asset registration and management
- User management
- System configuration
- Audit log access

### 4.2 Asset Manager
- Asset assignment and tracking
- Status updates
- Audit report generation
- Analytics dashboard access

### 4.3 Employee
- View assigned assets
- Report asset issues
- Request asset returns

## 5. Key Use Cases

### 5.1 Asset Registration Flow
1. Admin creates new asset record
2. System generates unique asset ID and QR code
3. Asset details are saved with initial REGISTERED status
4. Audit log entry is created

### 5.2 Asset Assignment Flow
1. Manager selects asset and assignee
2. System validates asset availability
3. Ownership is transferred
4. Status changes to ASSIGNED
5. Assignment history is recorded

### 5.3 Asset Return Flow
1. Employee initiates return request
2. Manager approves return
3. Ownership is cleared
4. Status updates to REGISTERED
5. Return action is logged

### 5.4 Asset Repair Flow
1. Asset is marked as IN_REPAIR
2. Repair details and vendor information are recorded
3. Asset cannot be assigned during repair
4. Upon completion, status returns to REGISTERED or ASSIGNED

### 5.5 Audit and Reporting Flow
1. User accesses audit dashboard
2. Filters are applied (date range, asset, user)
3. System generates audit report
4. Report can be exported or printed

## 6. Technical Architecture Requirements

### 6.1 Backend Technology
- Framework: Java Spring Boot
- API Style: RESTful API
- Database: PostgreSQL
- Architecture: Clean architecture with layered structure

### 6.2 Frontend Technology
- Framework: React
- UI Style: Modern admin dashboard
- Responsive design for desktop and tablet

### 6.3 Core Technical Features
- Audit and logging mechanism
- Clean architecture and scalable structure
- RESTful API design
- Database schema with proper relationships
- Entity relationship management
- State machine for lifecycle management
- Business rule validation
- Security model implementation

## 7. Data Model Requirements

### 7.1 Asset Entity
- Unique identifier
- Name and description
- Type and category
- Serial number (unique)
- Image reference
- Purchase date
- Current status
- Current owner (employee/department/branch)
- Branch location
- Department
- QR code reference
- Creation and update timestamps

### 7.2 Audit Log Entity
- Unique identifier
- Asset reference
- Action type
- User who performed action
- Timestamp
- Previous state
- New state
- Reason/comment
- Immutable flag

### 7.3 Assignment History Entity
- Unique identifier
- Asset reference
- Owner type (employee/department/branch)
- Owner identifier
- Assignment date
- Return date
- Status during assignment

### 7.4 Employee Entity
- Unique identifier
- First name and last name
- Email (unique)
- Department
- Branch
- Creation and update timestamps

### 7.5 Asset Status History Entity
- Unique identifier
- Asset reference
- Previous status
- New status
- Changed at timestamp
- Changed by user
- Reason

## 8. Business Rules and Validations

### 8.1 Asset Creation Rules
- Serial number must be unique
- Purchase date cannot be in the future
- Category must be from predefined list
- All mandatory fields must be provided

### 8.2 Status Transition Rules
- LOST assets cannot transition to ASSIGNED
- WRITTEN_OFF is terminal (no further transitions)
- IN_REPAIR assets must complete repair before assignment
- All transitions must include reason/comment

### 8.3 Assignment Rules
- Asset must be in REGISTERED or ASSIGNED status
- Asset cannot have multiple active owners
- Assignment must specify owner type and identifier
- Previous assignment must be closed before new assignment

### 8.4 Audit Rules
- All state changes must create audit log entry
- Audit logs cannot be modified or deleted
- Audit entries must include user and timestamp
- Sensitive actions require additional logging

## 9. Security Requirements

### 9.1 Authentication
- User authentication required for all operations
- Role-based access control

### 9.2 Authorization
- Admin: Full access to all features
- Asset Manager: Asset management and reporting
- Employee: View own assets only

### 9.3 Data Protection
- Audit logs are immutable
- Sensitive data encryption
- Secure API endpoints

## 10. Analytics and Intelligence Features

### 10.1 Dashboard Components
- Total asset count by category
- Status distribution chart
- Aging assets list
- Recent activity timeline
- Risk alerts and notifications
- Health score distribution
- Risk score distribution

### 10.2 Report Types
- Asset inventory report
- Audit trail report
- Assignment history report
- Risk assessment report
- Aging asset report
- Replacement recommendation report

## 11. QR Code Functionality

### 11.1 QR Generation
- Unique QR code per asset
- QR contains asset identifier
- Printable format for physical labels

### 11.2 QR Scanning
- Scan opens asset detail page
- Display asset passport information
- Show current status and owner
- Access to full history

## 12. Backend Implementation Structure

### 12.1 Package Structure
```
com.smartasset/
├── entity/
│   ├── Asset.java
│   ├── Employee.java
│   ├── AssetAssignmentHistory.java
│   ├── AssetStatusHistory.java
│   └── AuditLog.java
├── enums/
│   ├── AssetStatus.java
│   ├── AssetCategory.java
│   └── AuditActionType.java
├── dto/
│   ├── request/
│   └── response/
├── repository/
├── service/
├── controller/
└── exception/
```

### 12.2 REST API Endpoints

#### Asset Management
- POST /api/assets - Create asset
- GET /api/assets - List all assets with filters
- GET /api/assets/{id} - Get asset by ID
- PUT /api/assets/{id} - Update asset
- POST /api/assets/{id}/assign - Assign asset
- POST /api/assets/{id}/return - Return asset
- POST /api/assets/{id}/status - Change status
- GET /api/assets/{id}/history - Get asset history
- GET /api/assets/{id}/qr - Get QR code
- GET /api/assets/{id}/health - Get health score
- GET /api/assets/{id}/risk - Get risk score

#### Employee Management
- POST /api/employees - Create employee
- GET /api/employees - List all employees
- GET /api/employees/{id} - Get employee by ID
- PUT /api/employees/{id} - Update employee

#### Dashboard and Analytics
- GET /api/dashboard/stats - Get dashboard statistics
- GET /api/dashboard/aging-assets - Get aging assets
- GET /api/dashboard/risky-assets - Get risky assets
- GET /api/dashboard/suspicious-assets - Get suspicious assets

#### Audit and Reporting
- GET /api/audit/logs - Get audit logs with filters
- GET /api/audit/summary - Get AI-generated audit summary

## 13. Frontend Implementation Structure

### 13.1 Page Structure
- Login - Authentication page
- Dashboard - Overview with statistics and charts
- Assets - Asset list with search and filters
- AssetDetail - Detailed asset view with history
- Employees - Employee list and management

### 13.2 Component Structure
- AssetTable - Tabular asset display
- StatCards - Dashboard metric cards
- AssignmentForm - Asset assignment form
- StatusBadge - Color-coded status indicator
- HistoryTimeline - Event timeline display
- RiskScoreCard - Risk score visualization
- HealthScoreCard - Health score visualization
- QRCodeDisplay - QR code display and print
- SearchBar - Search functionality
- FilterPanel - Filter controls

## 14. Database Schema

### 14.1 Tables
- employees
- assets
- asset_assignment_history
- asset_status_history
- audit_logs

### 14.2 Indexes
- idx_assets_serial on assets(serial_number)
- idx_assets_status on assets(status)
- idx_assets_category on assets(category)
- idx_assignment_asset on asset_assignment_history(asset_id)
- idx_assignment_employee on asset_assignment_history(employee_id)
- idx_status_history_asset on asset_status_history(asset_id)
- idx_audit_entity on audit_logs(entity_type, entity_id)

## 15. Sample Seed Data

### 15.1 Employees
- John Smith (IT, Headquarters)
- Sarah Johnson (Finance, Branch A)
- Michael Brown (Operations, Branch B)
- Emily Davis (HR, Headquarters)
- David Wilson (Security, Branch A)

### 15.2 Assets
- Dell Laptop XPS 15 (IT, REGISTERED)
- HP Printer LaserJet (OFFICE, ASSIGNED)
- Cisco Router 2900 (NETWORK, REGISTERED)
- Security Camera HD (SECURITY, ASSIGNED)
- Office Desk Standard (OFFICE, ASSIGNED)

## 16. Demo Scenarios

### 16.1 Scenario 1: Asset Registration and Assignment
1. Admin logs in
2. Navigate to Assets page
3. Click Add Asset
4. Fill in asset details
5. Submit to create asset
6. View asset in table with REGISTERED status
7. Click Assign button
8. Select employee and provide reason
9. Submit assignment
10. Verify asset status changed to ASSIGNED
11. Verify assignment history recorded

### 16.2 Scenario 2: Asset Status Tracking and Risk Analysis
1. Navigate to asset detail page
2. View current status and owner
3. View health score and risk score
4. Click Change Status
5. Select IN_REPAIR status
6. Provide reason
7. Submit status change
8. Verify status updated
9. View status history timeline
10. Verify audit log created
11. Check updated health and risk scores

### 16.3 Scenario 3: Dashboard Analytics and Intelligence
1. Navigate to Dashboard
2. View total assets count
3. View status distribution chart
4. View category distribution chart
5. View recent activity list
6. View aging assets table
7. View risky assets alerts
8. View suspicious assets flags
9. Click on asset to view details
10. Review AI-generated audit summary

## 17. Deployment and Demo Requirements

### 17.1 Local Development Setup
- Backend runs on http://localhost:8080
- Frontend runs on http://localhost:5173
- PostgreSQL database: smartasset_db

### 17.2 Presentation Points
- Problem-solution fit demonstration
- Key feature highlights
- Intelligence module demonstrations
- Competitive advantages
- Scalability and extensibility
- Hackathon readiness and demo impact

## 18. MVP Scope

### 18.1 Core MVP Features
- Asset registration and management
- Lifecycle status tracking
- Ownership and assignment
- Audit history logging
- QR code generation and scanning
- Basic search and filtering
- Dashboard with key metrics
- Health score calculation
- Risk score calculation
- Aging asset detection

### 18.2 Bonus Features
- AI-generated audit summaries
- Suspicious asset detection
- Advanced analytics and predictions
- Replacement recommendations
- Comment-based issue detection
- Mobile app for QR scanning