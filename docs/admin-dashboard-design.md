# Admin Dashboard Design Document

## Overview
This document outlines the design for the VetCEE Portal admin dashboard, which will serve as a Business Intelligence (BI) hub for administrators to monitor and manage various aspects of the platform.

## Dashboard Components

### 1. BI Cards
The dashboard will feature multiple cards displaying key metrics:

- **User Statistics**
  - Total registered users
  - New users this month
  - Pending approvals
  - User status distribution (pie chart)

- **Applications**
  - Total applications submitted
  - Applications pending review
  - Applications approved/rejected (last 30 days)
  - Trend chart (line graph)

- **Invoices**
  - Total invoices sent
  - Pending payments
  - Revenue this month
  - Payment status distribution (pie chart)

- **Reviews**
  - Reviews assigned
  - Reviews completed
  - Average review time
  - Reviews by status (stacked bar chart)

- **Courses**
  - Total courses
  - Courses approved
  - Courses pending review
  - Course categories distribution (pie chart)

### 2. Role-Based Access Control

- **Full Admins (AdminFull)**
  - Complete access to all dashboard elements
  - Can click through to detailed views
  - Full CRUD operations on all resources
  - Access to system settings

- **Read-Only Admins (AdminReadOnly)**
  - View-only access to all dashboard elements
  - Cannot modify any data
  - Can view detailed information but cannot edit
  - No access to sensitive operations

- **Reviewers**
  - Limited dashboard view focused on reviews
  - Can only access assigned reviews
  - Limited user information visibility

- **Providers**
  - Limited dashboard focused on their own courses
  - Can view status of their submissions
  - No access to other providers' data

### 3. Navigation Structure

- **Top Header**
  - Role-specific navigation links
  - User profile and settings
  - Notifications
  - Logout option

- **Main Navigation**
  - Dashboard (home)
  - User Management
  - Course Management
  - Review Management
  - Invoice Management
  - Reports
  - CMS Access

- **Quick Actions**
  - Add new user
  - Approve pending applications
  - Assign reviews
  - Generate reports

### 4. CMS Integration

- **CMS Access Button**
  - Direct link to the CMS interface
  - Single sign-on integration
  - Role-based permissions carried over

- **Content Preview**
  - Preview of recently published content
  - Content status indicators
  - Quick edit options for full admins

## UI/UX Considerations

- **Responsive Design**
  - Dashboard will adapt to different screen sizes
  - Mobile-friendly layout for on-the-go access

- **Accessibility**
  - High contrast options
  - Screen reader compatibility
  - Keyboard navigation support

- **Theming**
  - Professional color scheme
  - Consistent with VetCEE branding
  - Clear visual hierarchy

## Data Requirements

- **Real-time Updates**
  - Dashboard metrics will update in real-time
  - Websocket connection for live data

- **Filtering Options**
  - Date range selectors
  - Category filters
  - Status filters

- **Export Capabilities**
  - Export data as CSV/Excel
  - Generate PDF reports
  - Email scheduled reports

## Technical Implementation

- **Frontend**
  - React components for each card
  - Chart.js for data visualization
  - Context API for state management

- **Backend**
  - RESTful API endpoints for each metric
  - Aggregation queries for performance
  - Caching layer for frequently accessed data

- **Authentication**
  - JWT-based authentication
  - Role-based middleware
  - Session management

## Next Steps

1. Create wireframes for dashboard layout
2. Implement UI components with placeholder data
3. Connect to backend data sources
4. Implement role-based access control
5. Add CMS integration
6. Test with different user roles
7. Gather feedback and iterate
