# Functional Specification for VetCEE Portal

## 1. Overview

### Purpose
The VetCEE Portal is a web-based platform for veterinary continuing education and accreditation. It enables Providers to submit courses for approval, Reviewers to evaluate submissions, and Admins to manage users, roles, and system operations. The portal supports public CMS-driven pages (via Contentful) and secure, role-based access for authenticated users.

### Scope
- **Public Pages**: Home page and informational pages (e.g., About, Contact) managed via Contentful.
- **Authenticated Pages**: Dashboard, course submission, course review, learning modules, business profile, user management, and admin tools.
- **Authentication**: Magic link-based login/registration via email OTP, with multi-role support and account phases.
- **Roles**:
  - Provider: Submits and manages courses, invites team members.
  - Reviewer: Evaluates course submissions.
  - AdminFull: Manages users, roles, approvals, and can impersonate Providers.
  - AdminReadOnly: Views user and token data for oversight.
- **Deployment**: Self-hosted front end with MongoDB backend and Contentful CMS.

### Key Features
- CMS-driven public pages.
- Role-based dashboard with dynamic navigation.
- Course submission and review workflows.
- Multi-role authentication with magic links.
- Admin tools for user management, token tracking, and impersonation.
- Organization-based team management for Providers.

## 2. System Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18.3, TypeScript, Chakra UI v3.1.7.
- **Backend**: Next.js API routes, Prisma 5 with MongoDB.
- **Authentication**: Auth.js 5 with EmailProvider (magic links).
- **CMS**: Contentful for public pages.
- **Email**: Nodemailer with SMTP (e.g., Gmail, SendGrid).
- **Font**: Inter (via Next.js next/font/google).
- **Styling**: Chakra UI with custom theme (brand.500: #3182CE).

### Folder Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── check-email/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── register/complete/route.ts
│   │   │   ├── invite/route.ts
│   │   │   ├── impersonate/route.ts
│   ├── auth/
│   │   ├── register/
│   │   │   ├── personal/page.tsx
│   │   │   ├── business/page.tsx
│   │   │   ├── team/page.tsx
│   │   ├── verify-request/page.tsx
│   ├── admin/
│   │   ├── users/page.tsx
│   │   ├── tokens/page.tsx
│   │   ├── impersonate/page.tsx
│   ├── dashboard/page.tsx
│   ├── courses/page.tsx
│   ├── modules/page.tsx
│   ├── submit/page.tsx
│   ├── profile/page.tsx
│   ├── review/page.tsx
│   ├── invite/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MainLayout.tsx
│   ├── FormComponents.tsx
├── lib/
│   ├── prisma.ts
│   ├── contentful.ts
│   ├── auth.ts
├── types/
│   ├── index.ts
├── prisma/
│   ├── schema.prisma
├── middleware.ts
└── .env
```

### Integrations
- **MongoDB**: Stores users, organizations, courses, sessions, tokens, and audit logs.
- **Contentful**: Manages public page content (e.g., page content type with title, slug, content).
- **SMTP**: Sends magic link OTPs (e.g., Gmail SMTP, SendGrid).

## 3. Features and User Stories

### 3.1 Public Pages

#### Home Page (/)
- **Description**: Displays CMS-driven content from Contentful (title, rich text). Shows user name and roles if logged in.
- **User Stories**:
  - As a visitor, I want to view the home page to learn about VetCEE.
  - As a logged-in user, I want to see a personalized welcome message.
- **Components**: Container, VStack, Heading, Divider, Box, Flex, Button, Text.
- **Styling**: Chakra UI with brand.500 (#3182CE), responsive font sizes (base, md).

#### Other CMS Pages (e.g., /about, /contact)
- **Description**: Fetches Contentful pages by slug, similar to home page.
- **User Stories**:
  - As a visitor, I want to access informational pages.
- **Note**: Implemented later if required.

### 3.2 Authentication
- See Authentication Route Spec (Section 4) for details.

### 3.3 Dashboard (`/dashboard`)
- **Description**: Role-based dashboard showing relevant actions and guidelines.
- **User Stories**:
  - As a Provider, I want to see options to submit courses, view courses, and edit my profile.
  - As a Reviewer, I want to access course review tasks.
  - As an Admin, I want to view system status and access admin tools.
  - As any user, I want to see accreditation guidelines.
- **Components**: MainLayout, VStack, Heading, SimpleGrid, Card, CardBody, Text, Button.
- **Access**: Requires approved status and login.
- **Features**:
  - Displays user name and roles.
  - Cards for role-specific actions (e.g., "Apply for a Course" for Providers).
  - Static guidelines section.

### 3.4 Courses (`/courses`)
- **Description**: Lists approved courses, filterable by Provider.
- **User Stories**:
  - As a Provider, I want to view my approved courses.
  - As an Admin, I want to view all approved courses.
- **Components**: MainLayout, VStack, Heading, Table, Button, Select.
- **Access**: Providers (own courses), Admins (all courses).
- **Features**:
  - Table with columns: Title, Description, Status, Created.
  - Filter by organization for Providers.
  - Links to course details (/courses/[id]).

### 3.5 Learning Modules (`/modules`)
- **Description**: Displays learning modules for approved courses.
- **User Stories**:
  - As a Provider, I want to view modules for my courses.
  - As an Admin, I want to inspect modules.
- **Components**: MainLayout, VStack, Heading, Accordion, Button.
- **Access**: Providers (own modules), Admins (all modules).
- **Features**:
  - Accordion listing modules with session details (teacher, duration).
  - Links to module details (/modules/[id]).

### 3.6 Submit New Course (`/submit`)
- **Description**: Form for Providers to submit courses for approval.
- **User Stories**:
  - As a Provider, I want to submit a course with title, description, outcomes, sessions, and optional fields (QA, pedagogy, policies, teacher bios).
- **Components**: MainLayout, VStack, Heading, FormControl, Input, Textarea, Button, FormComponents.
- **Access**: Providers only.
- **Features**:
  - Multi-step form with validation.
  - Saves as pending in MongoDB.
  - Success toast on submission.

### 3.7 Business Profile (`/profile`)
- **Description**: Allows Providers to edit organization details.
- **User Stories**:
  - As a Provider, I want to update my organization's name and details.
- **Components**: MainLayout, VStack, Heading, FormControl, Input, Textarea, Button.
- **Access**: Providers only.
- **Features**:
  - Displays current Organization data.
  - Updates name and details fields.
  - Success toast on save.

### 3.8 Review Courses (`/review`)
- **Description**: Interface for Reviewers to evaluate pending courses.
- **User Stories**:
  - As a Reviewer, I want to view pending courses, approve, or reject them with comments.
- **Components**: MainLayout, VStack, Heading, Table, Button, Textarea.
- **Access**: Reviewers only.
- **Features**:
  - Table of pending courses with details.
  - Approve/Reject buttons with comment field.
  - Updates course status in MongoDB.

### 3.9 Invite Team (`/invite`)
- **Description**: Allows Providers to invite team members.
- **User Stories**:
  - As a Provider, I want to invite team members to collaborate on course submissions.
- **Components**: MainLayout, VStack, Heading, FormControl, Input, Button.
- **Access**: Providers only.
- **Features**:
  - Form to enter team member email.
  - Sends magic link to /auth/register/team.

### 3.10 Admin Tools

#### User Management (/admin/users)
- **Description**: Interface for Admins to manage users, roles, and approvals.
- **User Stories**:
  - As an AdminFull, I want to approve pending accounts and assign roles.
  - As an AdminReadOnly, I want to view user data.
- **Components**: MainLayout, VStack, Heading, Table, Button, Select.
- **Access**: AdminFull (edit), AdminReadOnly (view).
- **Features**:
  - Table with columns: Email, Name, Roles, Status.
  - Approve button for pending accounts.
  - Role multi-select for AdminFull.
  - Form to initiate new accounts (sends magic link).

#### Token Management (/admin/tokens)
- **Description**: Lists expired VerificationToken records.
- **User Stories**:
  - As an Admin, I want to track expired tokens to diagnose email delivery issues.
- **Components**: MainLayout, VStack, Heading, Table.
- **Access**: AdminFull, AdminReadOnly.
- **Features**:
  - Table with columns: Email, Token (partial), Expires, Created.
  - Filter by email domain.

#### Impersonate (/admin/impersonate)
- **Description**: Allows AdminFull to assume Provider identities.
- **User Stories**:
  - As an AdminFull, I want to impersonate a Provider to troubleshoot issues.
- **Components**: MainLayout, VStack, Heading, Select, Button.
- **Access**: AdminFull only.
- **Features**:
  - Dropdown of Provider users.
  - Impersonate button logs action in AuditLog.

## 4. Functional Specification for Authentication Route

### 4.1 Overview
- **Purpose**: Securely authenticate users via magic links, support multiple roles (Provider, Reviewer, AdminFull, AdminReadOnly), and manage account phases (draft, pending, approved).
- **Components**:
  - Modal in Header.tsx: Handles login/registration flow.
  - API Routes: /api/auth/[...nextauth], /api/auth/check-email, /api/auth/register, /api/auth/register/complete, /api/auth/invite, /api/auth/impersonate.
  - Pages: /auth/register/personal, /auth/register/business, /auth/register/team, /auth/verify-request.
  - Prisma Models: User, Organization, VerificationToken, Account, Session, AuditLog.
  - Auth.js: Configured with EmailProvider and PrismaAdapter.

### 4.2 User Stories
- **Login**:
  - As a user, I want to enter my email in a modal to receive a magic link and sign in to my dashboard.
- **Registration (New User)**:
  - As a new user, I want to register as a Reviewer or Provider, confirm my email, and complete registration via a magic link.
- **Team Invitation**:
  - As a Provider, I want to invite team members who complete a short registration and join my organization.
- **Admin-Initiated Account**:
  - As an AdminFull, I want to create accounts for new users, sending them directly to registration.
- **Account Approval**:
  - As a new Provider/Reviewer, I want my account to be approved by an Admin before accessing the dashboard.
- **Role-Based Access**:
  - As a user, I want navigation links tailored to my roles.
- **Admin Impersonation**:
  - As an AdminFull, I want to impersonate a Provider with logged actions.
- **Token Tracking**:
  - As an Admin, I want to view expired tokens to troubleshoot email issues.

### 4.3 Features
- **Login Flow**:
  - User clicks "Sign In" in Header.tsx, opening a modal.
  - Enters email, which is checked via /api/auth/check-email.
    - Exists: Sends login magic link via Auth.js, redirects to /auth/verify-request.
    - Doesn't Exist: Prompts to confirm email and select role (Reviewer, Provider).
  - New user submits confirmed email and role, triggering /api/auth/register to send a registration link to /auth/register/personal or /auth/register/business.
- **Registration Flow**:
  - Personal (Reviewer): Form with name, email (disabled), submits to /api/auth/register/complete, sets status: pending.
  - Business (Provider): Form with name, organization name, organization details, submits to /api/auth/register/complete, creates Organization, sets status: pending.
  - Team (Provider): Form with name, email (disabled), submits to /api/auth/register/complete, links to existing orgId, sets status: approved.
  - Auto-signs in after registration with a new login link.
- **Team Invitation**:
  - Provider submits team member email via /invite, triggering /api/auth/invite.
  - Sends magic link to /auth/register/team with orgId.
- **Admin-Initiated Account**:
  - AdminFull submits email and role via /admin/users, calling /api/auth/register with pre-set role (AdminFull, AdminReadOnly, Reviewer, Provider).
  - Sets status: approved for Admins, pending for others.
- **Account Phases**:
  - Draft: Created after OTP sent (VerificationToken with status: active).
  - Pending: New Reviewer/Provider accounts awaiting approval.
  - Approved: Active accounts (auto-approved for invited team members, Admins).
  - Middleware checks user.status === "approved" for protected routes.
- **Session Management**:
  - Admin sessions expire after 8 hours.
  - Other sessions expire after 24 hours.
  - Roles and status included in JWT and session.
- **Role-Based Navigation**:
  - Header.tsx filters navItems based on session.user.roles:
    - All: /, /dashboard.
    - Provider: /courses, /modules, /submit, /profile, /invite.
    - Reviewer: /review.
    - AdminFull/AdminReadOnly: /admin/users, /admin/tokens.
    - AdminFull: /admin/impersonate.
- **Impersonation**:
  - AdminFull selects Provider via /admin/impersonate, calls /api/auth/impersonate.
  - Logs action in AuditLog and signs in as the target user.
- **Token Tracking**:
  - VerificationToken model tracks status (active, used, expired).
  - Tokens auto-expire after 24 hours, updated to expired via cron job or API.
  - /admin/tokens displays expired tokens with email, partial token, expires, and created dates.

### 4.4 API Routes
- **/api/auth/[...nextauth]**: Handles Auth.js routes (login, callback).
- **/api/auth/check-email**:
  - Method: POST
  - Input: { email: string }
  - Output: { exists: boolean }
  - Logic: Checks if email exists in User model.
- **/api/auth/register**:
  - Method: POST
  - Input: { email: string, confirmEmail: string, role: string, invitedBy?: string, orgId?: string }
  - Output: { message: string } or { error: string }
  - Logic: Validates emails match, creates VerificationToken, sends magic link.
- **/api/auth/register/complete**:
  - Method: POST
  - Input: { email: string, token: string, name: string, orgName?: string, orgDetails?: string, role: string, orgId?: string }
  - Output: { message: string } or { error: string }
  - Logic: Validates token, creates User and Organization (if Provider), auto-signs in.
- **/api/auth/invite**:
  - Method: POST
  - Input: { email: string }
  - Output: { message: string } or { error: string }
  - Logic: Verifies Provider role, calls /api/auth/register with orgId.
- **/api/auth/impersonate**:
  - Method: POST
  - Input: { targetUserId: string }
  - Output: { message: string } or { error: string }
  - Logic: Verifies AdminFull, logs action, signs in as target user.

### 4.5 Pages
- **/auth/register/personal**: Reviewer registration form.
- **/auth/register/business**: Provider registration with organization details.
- **/auth/register/team**: Team member registration (name only).
- **/auth/verify-request**: Confirms magic link sent.

### 4.6 Security
- **Magic Links**: Tokens expire after 24 hours, stored securely in VerificationToken.
- **RBAC**: Middleware checks roles and status for protected routes.
- **Impersonation**: Logged in AuditLog with user ID and timestamp.
- **Email Validation**: Ensures emails match during registration.
- **Session**: JWT with role and status data, short-lived for Admins.

## 5. Non-Functional Requirements
- **Performance**:
  - Page load time < 2 seconds for public pages.
  - API response time < 500ms for auth routes.
  - Server-side rendering for SEO on public pages.
- **Security**:
  - HTTPS for all requests.
  - Secure SMTP for email delivery.
  - No sensitive data (e.g., tokens) exposed in client.
  - Audit logging for admin actions.
- **Usability**:
  - Responsive design (mobile, tablet, desktop) using Chakra UI breakpoints.
  - Consistent brand.500 (#3182CE) theme.
  - Accessible forms with ARIA labels.
- **Scalability**:
  - MongoDB for flexible schema and high read/write loads.
  - Contentful for scalable CMS content delivery.
- **Reliability**:
  - Email delivery success rate > 95% (using SendGrid or similar).
  - Auto-expire draft tokens after 48 hours.

## 6. Assumptions and Constraints
- **Assumptions**:
  - MongoDB and Contentful credentials are provided or placeholders are used for testing.
  - SMTP service (e.g., Gmail, SendGrid) is configured for email delivery.
  - No additional public pages (e.g., /about) are required in this phase.
  - Course and module details (e.g., fields) are as specified in prisma/schema.prisma.
  - Admin tools are basic (table-based) for now, with potential enhancements later.
- **Constraints**:
  - Self-hosted deployment limits cloud-specific features (e.g., Vercel auth).
  - No OAuth or SMS OTP per your request.
  - Admin session timeout fixed at 8 hours, others at 24 hours.
  - Contentful requires a page content type with title, slug, content fields.

## 7. Open Questions
1. **Navigation Links**: Please confirm the proposed navigation per role (Section 3.10) or specify changes.
2. **Existing Code**: Are there modified files (e.g., src/app/page.tsx, src/lib/auth.ts) I should incorporate?
3. **Email Service**: Is an SMTP service set up, or should I use a placeholder/MailHog for testing?
4. **Admin Tool Enhancements**: Should /admin/users include advanced filtering or role assignment UI in this phase?
5. **Course/Module Details**: Are the Course and CourseSession schemas sufficient, or do you need additional fields?

## Next Steps
Once you confirm the functional specification:
- **Step 4**: Implement the auth routes, dashboard, and admin tools as outlined, updating Header.tsx, API routes, and pages.
- **Step 5**: Build remaining pages (/courses, /modules, /submit, /profile, /review, /invite).
- **Testing**: Run npm run dev to test auth flow, Contentful integration, and role-based access.

**Can Run Dev?**: Yes, with Step 2 files, you can run:
```
npm run dev
```
This shows the home page (/) with Chakra styling. The auth flow and other pages require Step 3/4 implementation.
