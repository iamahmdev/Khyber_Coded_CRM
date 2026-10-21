# Khyber Coded CRM — 44-Module Implementation Roadmap & Antigravity Prompts
> \*\*Purpose:\*\* This README is the master reference for implementing the Khyber Coded CRM module by module. Copy and paste \*\*one module prompt at a time\*\* into Antigravity. Do not ask Antigravity to implement all modules at once.
>
> \*\*Important accuracy note:\*\* This document consolidates the module plan and prompts from the available conversation context into one standalone file. It is a practical master prompt pack, not proof that every module is already implemented or that every proposed feature has been approved by Khyber Coded. The actual repository and business requirements must be inspected before implementation.
---
Contents
Project context and non-negotiable rules
Module sequence
Module 1 — Project Setup & Architecture
Module 2 — Authentication
Module 3 — Users & Roles
Module 4 — Dashboard
Module 5 — Leads Management
Module 6 — Clients & Contacts
Module 7 — Sales Pipeline
Module 8 — Follow-ups & Communication
Module 9 — Quotations & Proposals
Module 10 — Services & Packages
Module 11 — Projects Management
Module 12 — Tasks & Assignments
Module 13 — Deliverables & Client Approvals
Module 14 — Invoices & Payments
Module 15 — Expenses & Profitability
Module 16 — Contracts & Renewals
Module 17 — Employees & Departments
Module 18 — Attendance & Leave
Module 19 — Notifications & Email
Module 20 — Documents & Files
Module 21 — Reports & Analytics
Module 22 — Security & Activity Logs
Module 23 — Company Settings
Module 24 — Testing & Deployment
Module 25 — Website Inquiry Integration
Module 26 — Marketing Campaigns
Module 27 — SEO Project Tracking
Module 28 — Social Media Workflows
Module 29 — Advertising Campaign Tracking
Module 30 — Support & Maintenance
Module 31 — Client Portal
Module 32 — Quality Assurance
Module 33 — Time Tracking
Module 34 — Workload & Capacity
Module 35 — Recruitment
Module 36 — Knowledge Base
Module 37 — Integrations
Module 38 — Data Import/Export
Module 39 — Backup & Recovery
Module 40 — System Monitoring
Module 41 — Privacy & Data Retention
Module 42 — Workflow Automation
Module 43 — Customer Feedback
Module 44 — Business Continuity
---
Project context and non-negotiable rules
Project: Khyber Coded CRM  
Company website/context: https://khybercoded.com/  
Expected backend stack from current project context: Node.js + Express + TypeScript + MongoDB. The actual repository is the source of truth; if it differs, do not replace the stack just to match this README.
Shared instructions — apply to every module prompt
The following rules are repeated in each module prompt intentionally, so each prompt can be copied and used independently.
Inspect before changing anything. Read the existing repository, `package.json`, TypeScript configuration, environment example, routes, controllers, models, services, middleware, tests, and README. Check the current Git branch and working-tree status first.
Respect existing architecture. Follow the current MVC/layered architecture and naming conventions. Reuse existing utilities, middleware, models, validation patterns, and error handling. Do not duplicate functionality that already exists.
Do not silently change technology. Keep Node.js, Express, TypeScript, MongoDB, and existing frontend technology if that is what the repository currently uses. Do not migrate frameworks or replace the database without explicit approval.
Security first. Validate and sanitize untrusted input; enforce authentication and role-based authorization on the server; never trust frontend-only checks; avoid leaking secrets or stack traces; use safe database queries; protect sensitive records and uploaded files.
Environment safety. Never commit `.env` or real credentials. Keep `.env.example` limited to placeholder values. Do not print secrets in logs or reports. Do not delete environment files.
Data safety. Never wipe, reset, or destructively migrate a real/local database. Use a separate isolated test database for automated tests. Preserve existing records and schemas unless a safe migration is necessary.
Automated tests are required. Use Jest + Supertest for backend/API tests, following the repository's existing setup. Add tests for success, validation failures, unauthorized access, forbidden access, not-found cases, and important edge cases. Mock external services where appropriate. Do not use manual Postman testing as a substitute for automated tests.
Verify honestly. Run the relevant test suite (normally `npm test`), TypeScript type checking, and lint/build scripts that actually exist. Report exact commands and actual PASS/FAIL/NOT RUN results. Never claim tests passed if they were not run.
Git safety. Use the requested feature branch only after checking the current branch and status. If there are uncommitted user changes, do not overwrite, discard, or stash them without permission. Do not commit, push, merge, or open a PR unless explicitly approved.
Scope control. Implement only the current module and required integration points. Avoid unrelated refactors and avoid creating fake data or placeholder integrations that look production-ready.
Requirements uncertainty. This is a proposed 44-module roadmap. Confirm from the current application and available business requirements whether optional modules are actually needed. Do not invent company policies, tax rules, prices, email credentials, third-party accounts, or legal requirements.
Completion report. At the end, summarize files changed, features implemented, data/model changes, routes/endpoints, security considerations, automated tests added, exact verification results, remaining issues/blockers, and manual setup required. Clearly mark anything incomplete.
Stop after the requested module. Do not start the next module. Wait for the user to review and approve before continuing.
---
Module sequence
#	Module	Suggested feature branch
1	Project Setup & Architecture	`feature/m1-project-setup`
2	Authentication	`feature/m2-authentication`
3	Users & Roles	`feature/m3-users-roles`
4	Dashboard	`feature/m4-dashboard`
5	Leads Management	`feature/m5-leads-management`
6	Clients & Contacts	`feature/m6-clients-contacts`
7	Sales Pipeline	`feature/m7-sales-pipeline`
8	Follow-ups & Communication	`feature/m8-followups-communication`
9	Quotations & Proposals	`feature/m9-quotations-proposals`
10	Services & Packages	`feature/m10-services-packages`
11	Projects Management	`feature/m11-projects-management`
12	Tasks & Assignments	`feature/m12-tasks-assignments`
13	Deliverables & Client Approvals	`feature/m13-deliverables-approvals`
14	Invoices & Payments	`feature/m14-invoices-payments`
15	Expenses & Profitability	`feature/m15-expenses-profitability`
16	Contracts & Renewals	`feature/m16-contracts-renewals`
17	Employees & Departments	`feature/m17-employees-departments`
18	Attendance & Leave	`feature/m18-attendance-leave`
19	Notifications & Email	`feature/m19-notifications-email`
20	Documents & Files	`feature/m20-documents-files`
21	Reports & Analytics	`feature/m21-reports-analytics`
22	Security & Activity Logs	`feature/m22-security-activity-logs`
23	Company Settings	`feature/m23-company-settings`
24	Testing & Deployment	`feature/m24-testing-deployment`
25	Website Inquiry Integration	`feature/m25-website-inquiries`
26	Marketing Campaigns	`feature/m26-marketing-campaigns`
27	SEO Project Tracking	`feature/m27-seo-tracking`
28	Social Media Workflows	`feature/m28-social-media`
29	Advertising Campaign Tracking	`feature/m29-advertising-tracking`
30	Support & Maintenance	`feature/m30-support-maintenance`
31	Client Portal	`feature/m31-client-portal`
32	Quality Assurance	`feature/m32-quality-assurance`
33	Time Tracking	`feature/m33-time-tracking`
34	Workload & Capacity	`feature/m34-workload-capacity`
35	Recruitment	`feature/m35-recruitment`
36	Knowledge Base	`feature/m36-knowledge-base`
37	Integrations	`feature/m37-integrations`
38	Data Import/Export	`feature/m38-data-import-export`
39	Backup & Recovery	`feature/m39-backup-recovery`
40	System Monitoring	`feature/m40-system-monitoring`
41	Privacy & Data Retention	`feature/m41-privacy-data-retention`
42	Workflow Automation	`feature/m42-workflow-automation`
43	Customer Feedback	`feature/m43-customer-feedback`
44	Business Continuity	`feature/m44-business-continuity`
---
Module prompts
Module 1 — Project Setup & Architecture
Copy/paste prompt:
You are working on the Khyber Coded CRM repository. Implement Module 1: Project Setup & Architecture only.
First inspect the repository and determine what already exists. Do not assume it is empty and do not overwrite a working setup. The expected stack is Node.js, Express, TypeScript, and MongoDB, but the current repository is the source of truth. Keep the existing frontend and tooling if already configured.
Tasks:
Establish or verify a clean, maintainable project structure consistent with the repository's existing MVC/layered architecture (configuration, database connection, models, controllers, services, routes, middleware, validators, tests, and shared types/utilities where appropriate).
Verify the TypeScript configuration, scripts, development/build commands, lint/format setup if present, and application entry point.
Configure Express middleware in a safe and appropriate order: JSON/body parsing, CORS using the configured frontend origin, request logging if already used, security middleware, routes, not-found handling, and centralized error handling.
Configure MongoDB connection through environment variables, with clear connection errors and graceful shutdown where appropriate.
Create or update `.env.example` with placeholder values only. Expected local examples may include `PORT=8000`, `FRONTEND\_URL=http://localhost:5173`, and a local Mongo URI such as `mongodb://localhost:27017/khyber\_coded\_crm`; adjust to the actual project configuration. Never place real secrets in `.env.example`.
Add a health-check endpoint only if consistent with the existing app, and document how to run the application and tests.
Set up Jest and Supertest for isolated backend/API testing if not already configured. Ensure test setup does not connect to or clear a real development database.
Avoid adding unnecessary dependencies or creating modules that belong to later roadmap items.
Branch: `feature/m1-project-setup`. Check Git status first; do not overwrite existing changes. Add basic tests for the health check/application setup and any essential configuration behavior. Run the available tests, type checking, lint, and build scripts. Report exact outcomes. Do not commit, push, or merge without approval. Stop after Module 1.
---
Module 2 — Authentication
Copy/paste prompt:
Implement Module 2: Authentication for Khyber Coded CRM only. Inspect the current repository and Module 1 setup first. Preserve the current stack, architecture, route conventions, error handling, and frontend approach. Do not rebuild the project or duplicate existing authentication.
Implement the authentication flows that are appropriate for the existing application:
User registration with validated fields and safe defaults. Do not allow public registration to assign privileged roles.
Login with generic, safe error messages and appropriate throttling/rate limiting if the project has this pattern.
Secure password hashing using the library already present, or a suitable established library such as bcrypt if no implementation exists. Never store plaintext passwords.
Access-token/session handling consistent with the existing application. If JWT is the current design, use environment-configured secrets, sensible expiration, signature verification, and safe token handling. Never hardcode JWT secrets. Do not introduce conflicting token strategies.
Authentication middleware to protect private routes.
`GET /api/auth/me` (or the repository's equivalent) to return the authenticated user's safe profile without password hashes, reset tokens, or other secrets.
Logout appropriate to the actual token/session design. If refresh tokens or server-side sessions exist, invalidate them correctly rather than claiming that a stateless access token has been revoked when it has not.
Forgot-password and reset-password flows with secure, time-limited, single-use reset tokens, safe responses that do not reveal whether an email exists, and no production email credentials hardcoded in code. Use the existing email provider if configured; otherwise document required environment setup and keep the flow safe.
Input validation, centralized error handling, and protection against brute-force attempts where appropriate.
Update `.env.example` with placeholders for required authentication/email settings only. Do not expose actual secrets or modify/delete `.env` destructively.
Use the existing routes/controllers/services/models/middleware structure. Ensure passwords and tokens are never logged and private routes return correct unauthorized responses.
Branch: `feature/m2-authentication`. Add Jest + Supertest automated tests for registration, duplicate accounts, invalid inputs, password hashing, login success/failure, protected routes, `/me`, logout behavior, forgot-password response, valid/expired/reused reset tokens, and unauthorized access. Use an isolated test database and mock email delivery where appropriate. Run `npm test` and existing type-check/lint/build scripts; report real results only. Do not commit, push, or merge without approval. Stop after Module 2.
---
Module 3 — Users & Roles
Copy/paste prompt:
Implement Module 3: Users & Roles only, building on the existing project setup and authentication. Inspect the current user model, auth middleware, routes, controllers, frontend, and tests first. Reuse existing code and do not create duplicate user/auth systems.
Requirements:
Define or verify the roles actually needed by the current business requirements. If requirements are not documented, propose a minimal role/permission design and identify assumptions rather than inventing company policy.
Implement role-based access control on the server. Frontend hiding of buttons or pages is not sufficient authorization.
Provide safe user-management operations appropriate to the confirmed roles: list users, view a user, create/invite users if needed, update permitted profile/role fields, activate/deactivate if supported, and delete only if the business rules allow it.
Prevent privilege escalation: ordinary users must not grant themselves administrator/owner roles. Protect the last active owner/admin if that is part of the agreed policy. Do not allow users to bypass authorization by changing request payloads.
Exclude password hashes, reset tokens, and other secrets from API responses.
Add pagination, filtering, sorting, and validation only in a way that matches the existing API patterns.
Define clear access rules for each role and document them. Do not guess permissions for sensitive modules; mark unresolved rules for confirmation.
Add safe frontend user-management screens only if the repository already contains a frontend that should be extended.
Branch: `feature/m3-users-roles`. Add Jest + Supertest tests for permitted/forbidden actions, unauthenticated requests, role escalation attempts, invalid user IDs, validation failures, sensitive-field exclusion, and user listing behavior. Use an isolated test database. Run tests, type checking, lint, and build where available. Report actual outcomes and remaining decisions. Do not commit, push, or merge without approval. Stop after Module 3.
---
Module 4 — Dashboard
Copy/paste prompt:
Implement Module 4: Dashboard only. Inspect the repository, completed modules, existing UI, available models, authentication, and role permissions before coding.
Requirements:
Build a useful CRM dashboard using real data from modules that already exist. Do not fabricate counts, revenue, leads, clients, projects, tasks, or charts.
Show only metrics the authenticated user's role is authorized to see.
Include appropriate summaries such as total leads, active clients, open opportunities, active projects, pending tasks, overdue follow-ups, or revenue only when the underlying module/data exists and the user has permission.
Use efficient database queries and avoid unnecessary repeated queries. Add indexes only when justified by query patterns.
Include loading, empty, and error states in the existing frontend style.
Handle date ranges and timezone boundaries consistently with the project.
If a metric depends on a future module, omit it or label it as not yet available rather than using fake data.
Keep API response shapes and UI components consistent with the existing application.
Branch: `feature/m4-dashboard`. Add Jest + Supertest tests for authenticated access, unauthorized access, role-scoped results, empty data, and correct calculations for implemented metrics. Mock or isolate data as appropriate. Run tests, type checking, lint, and build. Report exact outcomes, blockers, and the data sources used for each metric. Do not commit, push, or merge without approval. Stop after Module 4.
---
Module 5 — Leads Management
Copy/paste prompt:
Implement Module 5: Leads Management only, integrating with existing authentication and role permissions.
Requirements:
Create or verify a lead model/schema with validated fields appropriate to the business, such as name, company, email, phone, source, status, owner/assignee, notes, and timestamps. Do not require fields the business does not need.
Provide authorized create, list, detail, update, and archive/delete operations according to established data-retention rules. Prefer archive/soft delete if the repository uses that pattern.
Add pagination, filtering, sorting, search, and validation using existing conventions.
Prevent duplicate or conflicting records where a clear business rule exists; do not impose arbitrary uniqueness rules without considering shared company contacts.
Enforce record visibility and assignment permissions server-side.
Record relevant status/assignment changes if an audit-log module already exists; do not build a second audit system.
Provide frontend list/detail/create/edit UI consistent with the current app, including loading, empty, and validation-error states.
Prepare a clean integration point for converting a qualified lead into a client in Module 6, but do not implement Module 6 prematurely.
Branch: `feature/m5-leads-management`. Add Jest + Supertest tests for CRUD, validation, search/filter/pagination, unauthorized and forbidden access, assignment permissions, not-found records, and duplicate handling if implemented. Run tests, type checking, lint, and build. Report exact outcomes. Do not commit, push, or merge without approval. Stop after Module 5.
---
Module 6 — Clients & Contacts
Copy/paste prompt:
Implement Module 6: Clients & Contacts only. Inspect the lead model and current user/role architecture first. Reuse existing entities and avoid duplicate client/contact models if equivalent structures already exist.
Requirements:
Implement client/company records and associated contact people according to the existing domain model.
Support authorized create, list, detail, update, and archive/deactivation operations.
Validate names, emails, phone numbers, website URLs, addresses, and other fields that are actually used. Normalize fields where appropriate without destroying user input.
Support search, pagination, sorting, and filters following existing API conventions.
If lead conversion is part of the current business workflow, implement it safely and idempotently: avoid creating duplicate clients if the conversion is retried, preserve relevant lead history, and link the source lead to the created client.
Protect client/contact data with server-side authorization and appropriate field visibility.
Add frontend pages/forms consistent with the current application.
Do not build invoices, contracts, or the client portal here; provide reliable relationships for later modules.
Branch: `feature/m6-clients-contacts`. Add Jest + Supertest tests for client/contact CRUD, validation, duplicate handling where applicable, lead conversion and repeat attempts if implemented, permissions, search, and not-found behavior. Run tests, type checking, lint, and build. Report exact outcomes. Do not commit, push, or merge without approval. Stop after Module 6.
---
Module 7 — Sales Pipeline
Copy/paste prompt:
Implement Module 7: Sales Pipeline only, using existing leads, clients, users, and role permissions.
Requirements:
Represent sales opportunities/deals and their relationship to a lead or client.
Define configurable or documented stages only after inspecting existing requirements. A possible default flow may include New, Qualified, Proposal, Negotiation, Won, and Lost, but do not impose it if the project already defines different stages.
Support authorized create, update, assignment, stage changes, list/detail, and filtering.
Track stage history and relevant timestamps if useful and consistent with existing data architecture.
Validate deal value and currency fields using safe numeric handling; never trust totals sent from the frontend.
Prevent invalid stage transitions if the business rules require it.
Provide a pipeline board or list view using the existing frontend approach. Ensure the server still validates all changes.
Show actual pipeline summaries only from persisted records.
Branch: `feature/m7-sales-pipeline`. Add Jest + Supertest tests for CRUD, valid/invalid stage changes, role restrictions, assignment, search/filtering, and safe value validation. Run tests, type checking, lint, and build. Report results and assumptions. Do not commit, push, or merge without approval. Stop after Module 7.
---
Module 8 — Follow-ups & Communication
Copy/paste prompt:
Implement Module 8: Follow-ups & Communication only, linked to existing leads, clients, opportunities, and users.
Requirements:
Add follow-up activities such as calls, meetings, emails, and reminders where useful to the business.
Store activity type, related record, assigned user, due date/time, status, notes, and timestamps as appropriate.
Support create, list, detail, update, completion, and cancellation actions with authorization.
Provide filters for assignee, related lead/client/deal, due date, status, and overdue activities.
Handle timezone-aware dates consistently and avoid marking activities overdue incorrectly at date boundaries.
Store communication history and metadata, but do not claim an email or message was sent unless a real provider integration confirms it.
If notifications do not exist yet, expose a clean integration point instead of building a duplicate notification system.
Render a timeline/activity list in the existing UI.
Branch: `feature/m8-followups-communication`. Add Jest + Supertest tests for CRUD, due-date validation, completion/cancellation, permissions, filtering, and timezone/date edge cases. Run tests, type checking, lint, and build. Report exact outcomes. Do not commit, push, or merge without approval. Stop after Module 8.
---
Module 9 — Quotations & Proposals
Copy/paste prompt:
Implement Module 9: Quotations & Proposals only, integrating with existing clients, contacts, leads/opportunities, services, and users where those modules exist.
Requirements:
Create quotations/proposals with line items, descriptions, quantities, unit prices, discounts, taxes only when configured/required, currency, expiry date, notes, and status.
Calculate subtotals, discounts, taxes, and totals on the server using safe decimal/money handling. Never trust client-supplied calculated totals.
Add quotation numbering that is unique and safe under concurrent requests, using the repository's established numbering pattern if one exists.
Support draft, sent, accepted, rejected, and expired states only where the workflow is supported. Do not claim a quotation was emailed without a working email integration.
Preserve a snapshot of line-item descriptions/prices so later service-catalog edits do not silently alter historical quotations.
Enforce permissions for viewing and editing quotations and avoid exposing another user's records if access is scoped.
Provide appropriate UI for listing, creating, editing drafts, viewing, and status changes. Add PDF generation only if the project has a suitable established approach; otherwise document it as a future enhancement.
Branch: `feature/m9-quotations-proposals`. Add Jest + Supertest tests for calculations, rounding, invalid quantities/prices, numbering, status transitions, permissions, and validation. Run tests, type checking, lint, and build. Report actual outcomes. Do not commit, push, or merge without approval. Stop after Module 9.
---
Module 10 — Services & Packages
Copy/paste prompt:
Implement Module 10: Services & Packages only. Inspect the existing business model and quotation/project structures first.
Requirements:
Manage the service catalog and packages that Khyber Coded actually offers, with fields such as name, description, category, active/inactive status, and default price/currency only when applicable.
Support authorized create, list, view, update, activate/deactivate, search, and filtering.
Validate all values and use safe money handling for prices.
Do not invent the company's actual service list, package names, prices, discounts, or terms. Use existing repository data or create only clearly identified seed/demo data if the project already has a safe seed convention.
Link services to quotations or projects where appropriate, while preserving historical line-item snapshots.
Prevent deletion or destructive changes from breaking existing quotations/projects.
Add frontend management screens consistent with the current application.
Branch: `feature/m10-services-packages`. Add Jest + Supertest tests for CRUD, validation, authorization, active/inactive behavior, and protection of historical references. Run tests, type checking, lint, and build. Report any missing business decisions. Do not commit, push, or merge without approval. Stop after Module 10.
---
Module 11 — Projects Management
Copy/paste prompt:
Implement Module 11: Projects Management only, linked to existing clients, quotations, services, and assigned users where available.
Requirements:
Create and manage projects with validated name/code, client, description, status, start/end dates, project manager, assigned team, and links to accepted quotations/contracts when those modules exist.
Define project statuses from existing requirements; do not impose a new workflow if one already exists.
Support list, detail, create, update, search, filtering, pagination, and safe archive/closure.
Validate date ranges and authorized client/project associations.
Enforce role and project-level access on the server.
Show actual project progress based on real linked tasks/deliverables if those modules exist; do not fabricate progress percentages.
Keep a clean path for tasks, time tracking, invoices, documents, and deliverables to reference projects later.
Branch: `feature/m11-projects-management`. Add Jest + Supertest tests for CRUD, validation, date rules, client relationships, permissions, status transitions, and not-found behavior. Run tests, type checking, lint, and build. Report results. Do not commit, push, or merge without approval. Stop after Module 11.
---
Module 12 — Tasks & Assignments
Copy/paste prompt:
Implement Module 12: Tasks & Assignments only, using existing projects, users, clients, and role permissions.
Requirements:
Support task title, description, project/related record, assignee, creator, priority, status, due date, and timestamps as needed.
Allow authorized task creation, assignment/reassignment, updates, completion, reopening if allowed, and filtering.
Validate assignee and project references and ensure the user has permission to assign work to that person/project.
Support task lists and useful views (such as assigned to me, overdue, by project, by status) using the existing frontend conventions.
Calculate overdue state from dates consistently; do not rely on a user-controlled overdue flag.
Preserve task history where the current architecture supports it and avoid building a duplicate audit-log system.
Do not implement time tracking or workload forecasting here; keep integration points for later modules.
Branch: `feature/m12-tasks-assignments`. Add Jest + Supertest tests for task CRUD, assignment authorization, invalid references, status transitions, overdue logic, filtering, and unauthorized/forbidden requests. Run tests, type checking, lint, and build. Report results. Do not commit, push, or merge without approval. Stop after Module 12.
---
Module 13 — Deliverables & Client Approvals
Copy/paste prompt:
Implement Module 13: Deliverables & Client Approvals only, linked to projects, tasks, clients, and documents where available.
Requirements:
Track deliverables with title, description, project, owner, due date, status, version/reference, and approval state as appropriate.
Support submission for review, approve, request changes, and resubmission with validation and authorization.
Record who made each decision and when; preserve meaningful approval history rather than overwriting it without trace.
Ensure only authorized internal users or the correct client identity can approve a deliverable.
If file uploads are supported, reuse the secure file/document service; do not expose private files through public paths.
Show clear statuses and comments in the existing frontend.
Do not claim an external client has approved anything without an authenticated action recorded in the system.
Branch: `feature/m13-deliverables-approvals`. Add Jest + Supertest tests for approval transitions, unauthorized approval, client/project association, resubmission, history, and validation. Run tests, type checking, lint, and build. Report actual outcomes. Do not commit, push, or merge without approval. Stop after Module 13.
---
Module 14 — Invoices & Payments
Copy/paste prompt:
Implement Module 14: Invoices & Payments only, using existing clients, projects, quotations, and company settings where available.
Requirements:
Support invoice creation with unique invoice number, client, line items, issue/due dates, currency, subtotal, configured discounts/taxes, total, notes, and status.
Recalculate amounts on the server using safe decimal/money handling. Never accept a frontend total as authoritative.
Support payments and partial payments with amount, date, method, reference, and status as appropriate. Do not store card numbers or sensitive payment credentials.
Calculate amount paid and outstanding balance consistently; prevent overpayment or duplicate payment processing according to the confirmed business rules.
Keep payment status transitions valid (for example, draft, issued, partially paid, paid, overdue, void) and preserve financial history.
Use a safe, concurrency-aware invoice-numbering mechanism. Do not hardcode tax rules, payment methods, currency, or legal invoice language without requirements.
Do not claim a payment was collected through a gateway unless a real provider confirms it.
Enforce financial-record permissions and create audit events if the audit module exists.
Branch: `feature/m14-invoices-payments`. Add Jest + Supertest tests for totals, rounding, partial payments, outstanding balances, duplicate/invalid payments, status transitions, numbering, and permissions. Use an isolated test database and mock gateways if applicable. Run tests, type checking, lint, and build. Report results and unresolved finance/tax decisions. Do not commit, push, or merge without approval. Stop after Module 14.
---
Module 15 — Expenses & Profitability
Copy/paste prompt:
Implement Module 15: Expenses & Profitability only, linked to projects, invoices, and users where supported.
Requirements:
Record expenses with amount, currency, date, category, description, project/department, submitter, and approval status where the business requires it.
Validate amounts and required fields; never treat frontend totals as trusted.
Implement role-based viewing and approval permissions for financial data.
Calculate project profitability only from actual available revenue and expense records, clearly documenting the formula and excluding unavailable/unapproved values as appropriate.
Do not invent costs, revenue, reimbursement rules, tax handling, or approval thresholds.
Preserve financial history and avoid destructive updates to already approved records.
Provide filters and summary views without leaking restricted financial information.
Branch: `feature/m15-expenses-profitability`. Add Jest + Supertest tests for expense CRUD, permissions, approval rules if implemented, amount validation, and profitability calculations using known fixtures. Run tests, type checking, lint, and build. Report the exact formula and assumptions. Do not commit, push, or merge without approval. Stop after Module 15.
---
Module 16 — Contracts & Renewals
Copy/paste prompt:
Implement Module 16: Contracts & Renewals only, linked to clients, projects, quotations, and documents where available.
Requirements:
Track contracts with client, title/reference, start/end dates, status, renewal date, value/currency where applicable, responsible user, and secure document reference.
Validate date ranges and prevent unauthorized access to contract details and files.
Support draft, active, expired, renewed, and terminated states only as appropriate to the actual workflow.
Track renewal reminders and history without sending notifications unless the notification/email integration is configured.
Preserve old contract versions and renewal history where required.
Do not invent legal clauses, automatic-renewal rules, or contract terms. Do not generate legal advice as if it were approved company policy.
Reuse the document service rather than building a separate insecure file storage mechanism.
Branch: `feature/m16-contracts-renewals`. Add Jest + Supertest tests for validation, date/status behavior, access control, renewal history, and document authorization. Run tests, type checking, lint, and build. Report assumptions and required setup. Do not commit, push, or merge without approval. Stop after Module 16.
---
Module 17 — Employees & Departments
Copy/paste prompt:
Implement Module 17: Employees & Departments only. Inspect existing user records and roles first; do not create a second authentication identity for employees.
Requirements:
Represent employee profiles linked to existing users when appropriate, and manage departments/team structures if the business requires them.
Store only necessary employee fields, with sensitive fields restricted by role.
Support authorized create/update/list/detail and active/inactive states consistent with current policy.
Validate employee identifiers, email relationships, manager/department references, and dates.
Do not invent HR policies, salary information, employee classifications, or reporting hierarchies.
Ensure deactivating an employee does not silently delete their historical task, project, or audit records.
Reuse existing user/role permissions and keep HR-sensitive fields private.
Branch: `feature/m17-employees-departments`. Add Jest + Supertest tests for employee/department CRUD, relationship validation, permissions, sensitive-field exclusion, and deactivation behavior. Run tests, type checking, lint, and build. Report any requirements that need confirmation. Do not commit, push, or merge without approval. Stop after Module 17.
---
Module 18 — Attendance & Leave
Copy/paste prompt:
Implement Module 18: Attendance & Leave only if the repository or confirmed business requirements show that Khyber Coded needs this HR feature. First inspect current requirements and report whether it is applicable. Do not invent policies.
If approved/needed:
Track attendance events and leave requests using explicit, validated date/time rules.
Support leave request, review/approval/rejection, and history according to confirmed roles and policies.
Prevent duplicate or conflicting attendance entries where the rules define conflicts.
Handle timezone and day-boundary behavior consistently.
Restrict employee attendance/leave records to authorized viewers.
Keep a history of decisions and avoid deleting records that are needed for accountability.
Do not invent leave types, annual allowances, working hours, holidays, payroll deductions, or legal entitlements.
Branch: `feature/m18-attendance-leave`. Add Jest + Supertest tests for date validation, conflicting entries, leave status transitions, permissions, and boundary cases. Use isolated test data. Run tests, type checking, lint, and build. If requirements are not confirmed, do not implement guessed policy; report the blocker and stop this module without fabricating rules. Do not commit, push, or merge without approval. Stop after Module 18.
---
Module 19 — Notifications & Email
Copy/paste prompt:
Implement Module 19: Notifications & Email only, reusing existing authentication, events, and environment configuration.
Requirements:
Add an in-app notification model/service if one does not already exist, with recipient, type, message/reference, read/unread state, and timestamps as appropriate.
Support authorized notification listing, unread counts, and marking a notification read. A user must not read or alter another user's private notifications.
Add email delivery only through an explicitly configured provider and environment variables. Never hardcode credentials or report success when delivery was not confirmed.
Use templates and safe escaping for user-supplied content. Avoid including passwords, reset tokens, or sensitive data in email logs.
Use a queue/retry approach only if the project already has one or it is justified and can be safely configured.
Keep notification creation idempotent where retries could otherwise create duplicates.
Document required provider setup and local testing/mocking.
Branch: `feature/m19-notifications-email`. Add Jest + Supertest tests for ownership, unread counts, read status, safe email behavior, provider failure handling, and unauthorized requests. Mock external email providers. Run tests, type checking, lint, and build. Report which delivery paths are genuinely configured versus mocked. Do not commit, push, or merge without approval. Stop after Module 19.
---
Module 20 — Documents & Files
Copy/paste prompt:
Implement Module 20: Documents & Files only, reusing any existing upload/storage library and linking documents to authorized CRM records.
Requirements:
Support safe upload, listing, metadata, download, and deletion/archive as permitted.
Validate file size, extension, MIME type, and actual file content where feasible; generate safe server-side storage names and do not trust user-supplied paths.
Store private files outside publicly served directories or use private object storage with authorization checks.
Prevent path traversal, unauthorized downloads, unsafe file types, and access across clients/projects.
Define limits through configuration and document them. Do not upload sensitive files to a third-party service without an approved integration.
Record owner, related entity, size, type, timestamps, and metadata that the business needs.
Use a malware scanning integration only if configured; do not falsely claim scanning exists.
Avoid exposing internal filesystem paths or secrets in API responses.
Branch: `feature/m20-documents-files`. Add Jest + Supertest tests for upload validation, file limits, unauthorized access/download, path safety, invalid file types, and deletion/archive behavior. Mock storage as appropriate and use temporary isolated test files. Run tests, type checking, lint, and build. Report actual storage behavior and limitations. Do not commit, push, or merge without approval. Stop after Module 20.
---
Module 21 — Reports & Analytics
Copy/paste prompt:
Implement Module 21: Reports & Analytics only, using real records from existing modules.
Requirements:
Build useful reports for the data that actually exists, such as lead sources/conversion, pipeline stages, project status, tasks, invoices/payments, expenses, or service performance when those modules are implemented.
Ensure calculations have documented definitions and consistent date/time/currency treatment.
Apply role-based permissions to every report and filter; do not expose restricted financial, HR, or client data.
Support date-range filters, pagination or bounded result sizes, and export only if approved and safe.
Optimize aggregation/query patterns and avoid loading unbounded collections into memory.
Clearly distinguish missing data from zero values. Do not fabricate metrics or imply causation from simple correlations.
Keep the UI consistent with the current application and include empty/error states.
Branch: `feature/m21-reports-analytics`. Add Jest + Supertest tests for calculations, date filters, role restrictions, empty datasets, and export authorization if implemented. Use deterministic fixtures. Run tests, type checking, lint, and build. Report formulas and limitations. Do not commit, push, or merge without approval. Stop after Module 21.
---
Module 22 — Security & Activity Logs
Copy/paste prompt:
Implement Module 22: Security & Activity Logs only, strengthening rather than duplicating existing security middleware and audit logging.
Requirements:
Inspect current authentication, authorization, validation, rate limiting, CORS, error handling, and logging before making changes.
Add structured audit events for meaningful security-sensitive actions, such as role changes, record deletion/archive, financial status changes, permission failures, or configuration updates, as appropriate.
Log actor, action, target reference, timestamp, and safe metadata. Do not log passwords, tokens, full payment details, secrets, or unnecessary personal data.
Restrict access to audit logs and protect them from ordinary users changing or deleting history.
Improve security headers, request validation, safe error responses, and rate limiting only where gaps are confirmed.
Avoid logging sensitive request bodies. Define retention through confirmed requirements, not guesses.
Do not claim compliance with a standard unless it has been formally assessed.
Branch: `feature/m22-security-activity-logs`. Add Jest + Supertest tests for audit-event creation, restricted log access, sensitive-field redaction, and existing security controls. Verify that logging failures do not accidentally leak data or crash critical flows. Run tests, type checking, lint, and build. Report each control tested and any remaining gap. Do not commit, push, or merge without approval. Stop after Module 22.
---
Module 23 — Company Settings
Copy/paste prompt:
Implement Module 23: Company Settings only, using the current application's configuration and permission model.
Requirements:
Provide authorized management for company profile settings that the CRM actually needs, such as display name, logo reference, contact details, timezone, default currency, and supported business preferences.
Separate public/display settings from secrets and deployment configuration. Never expose environment secrets through a settings endpoint or UI.
Validate updates and restrict settings changes to the appropriate confirmed role.
Apply timezone/currency defaults consistently without rewriting historical invoice/quotation values.
Store secrets only through an appropriate secret-management/environment mechanism; do not store credentials as ordinary company settings.
Keep audit history for sensitive settings if the audit module exists.
Do not invent official company data, tax numbers, policies, currency, or branding assets.
Branch: `feature/m23-company-settings`. Add Jest + Supertest tests for validation, role restrictions, safe settings responses, immutable environment secrets, and default handling. Run tests, type checking, lint, and build. Report which settings are implemented and which need business confirmation. Do not commit, push, or merge without approval. Stop after Module 23.
---
Module 24 — Testing & Deployment
Copy/paste prompt:
Implement Module 24: Testing & Deployment only. Audit the existing application and scripts before changing them. Do not claim that deployment is complete unless a real deployment has been performed and verified.
Requirements:
Review and improve the automated test strategy, using Jest + Supertest for backend/API tests and the repository's existing tools for frontend tests if applicable.
Ensure tests use an isolated test database and cannot wipe or modify local/production data.
Verify scripts for test, coverage, type checking, lint, and production build. Add missing scripts only when appropriate.
Review environment-variable documentation, `.env.example`, CORS settings, secure cookie/token configuration, database connection settings, logging, and production error handling.
Document safe local setup, test commands, build commands, and deployment prerequisites.
Provide deployment configuration only for the actual chosen platform and current stack. Do not assume a provider or expose credentials.
Add or update CI checks only if the repository uses or is ready for CI; keep secrets in platform secret settings.
Do not run destructive migrations, change production data, or deploy to a live environment without explicit approval.
Branch: `feature/m24-testing-deployment`. Run the relevant automated tests, coverage command if available, type checking, lint, and production build. Report exact commands and real results. Clearly label deployment as NOT RUN unless it was actually performed. Do not commit, push, merge, or deploy without approval. Stop after Module 24.
---
Module 25 — Website Inquiry Integration
Copy/paste prompt:
Implement Module 25: Website Inquiry Integration only. Inspect the Khyber Coded website and current CRM API/repository for an existing inquiry/contact form integration. Do not modify the public website or claim a connection without verifying the available interface.
Requirements:
Create a secure integration endpoint or connector for website inquiries using the agreed data contract.
Validate and sanitize all incoming fields, apply rate limiting and abuse protections, and avoid exposing internal CRM APIs or privileged operations.
Use a shared secret/signature or other suitable server-to-server verification if the website can support it; keep secrets in environment variables.
Prevent spam and duplicate submissions where possible using a safe idempotency/deduplication strategy.
Map incoming inquiries to the existing lead model; store source and submission timestamp where appropriate.
Return minimal safe responses and never reveal internal records or error details.
Document the website-side configuration and required secrets. If access to the website or its code is unavailable, implement only the verified CRM-side interface and report what remains.
Branch: `feature/m25-website-inquiries`. Add Jest + Supertest tests for valid/invalid payloads, abuse/rate limits where testable, authentication/signature failures, duplicate submissions, and safe errors. Mock external calls. Run tests, type checking, lint, and build. Do not claim live integration until verified. Do not commit, push, merge, or deploy without approval. Stop after Module 25.
---
Module 26 — Marketing Campaigns
Copy/paste prompt:
Implement Module 26: Marketing Campaigns only if it fits confirmed Khyber Coded business requirements. Inspect existing lead sources and any marketing-related data first.
Requirements:
Track campaigns with name, channel, objective, start/end dates, owner, status, and budget only when the business uses those fields.
Link leads to a campaign/source where possible without rewriting historical attribution.
Calculate campaign metrics only from actual available data and document each formula.
Provide authorized CRUD, filtering, and summary views.
Do not claim that emails, ads, or social posts were sent/published by this module unless a real integration confirms it.
Do not invent budgets, campaign results, audiences, or customer consent.
If external marketing integrations are not configured, keep the module as internal tracking and document the limitation.
Branch: `feature/m26-marketing-campaigns`. Add Jest + Supertest tests for validation, date ranges, permissions, lead attribution, and metric calculations. Run tests, type checking, lint, and build. Report assumptions and any optional functionality not implemented. Do not commit, push, merge, or launch campaigns without approval. Stop after Module 26.
---
Module 27 — SEO Project Tracking
Copy/paste prompt:
Implement Module 27: SEO Project Tracking only if SEO service tracking is required by the business. Inspect existing project/task/service structures first.
Requirements:
Track SEO projects or retainers using client/project relationships and agreed fields such as target website, scope, assigned team, reporting period, status, and deliverables.
Support tasks/checklists and milestone tracking without duplicating the existing task/project modules.
Record keyword or ranking observations only if the source and measurement date are recorded. Do not fabricate rankings, traffic, backlinks, or analytics.
Integrate external SEO tools only when credentials, API access, and requirements are provided; otherwise provide manual data-entry/reporting structures.
Protect client data and any external account credentials.
Make reporting periods, definitions, and historical snapshots clear.
Branch: `feature/m27-seo-tracking`. Add Jest + Supertest tests for CRUD, access permissions, date/reporting-period validation, and source/measurement metadata. Mock any external service. Run tests, type checking, lint, and build. Report what is functional versus awaiting integration. Do not commit, push, merge, or change live client SEO settings without approval. Stop after Module 27.
---
Module 28 — Social Media Workflows
Copy/paste prompt:
Implement Module 28: Social Media Workflows only if it is part of the confirmed service workflow. Inspect current project/task/document modules and do not create duplicate systems.
Requirements:
Track client social accounts as safe references/metadata, content ideas, drafts, review status, planned publish date, platform, campaign, and assigned approver where needed.
Support a workflow such as draft, internal review, client approval, scheduled, published, or rejected only as appropriate.
Keep approval history and permissions clear.
Do not store platform passwords or access tokens as ordinary database fields.
Do not claim content was published or scheduled on a real platform unless an authorized integration confirms the result.
If publishing integration is unavailable, implement workflow tracking only and clearly document the limitation.
Reuse file/document storage for media attachments.
Branch: `feature/m28-social-media`. Add Jest + Supertest tests for workflow transitions, permissions, client approval, validation, and safe handling of integration failures. Mock external services. Run tests, type checking, lint, and build. Do not commit, push, merge, or publish content without approval. Stop after Module 28.
---
Module 29 — Advertising Campaign Tracking
Copy/paste prompt:
Implement Module 29: Advertising Campaign Tracking only if required. Inspect existing marketing campaigns, client projects, and available analytics integrations.
Requirements:
Track advertising campaigns and platform/channel metadata, client, objective, date range, owner, approved budget, and status where confirmed.
Store spend, impressions, clicks, conversions, and other metrics only when entered by an authorized user or received from a verified source. Store source and reporting period.
Document metric definitions and handle missing values accurately.
Never expose ad-platform credentials. Use approved secret/environment management for integrations.
Do not launch, pause, or modify live advertisements from this module unless the user explicitly authorizes a supported integration action.
Avoid presenting estimated or incomplete data as verified results.
Branch: `feature/m29-advertising-tracking`. Add Jest + Supertest tests for validation, date ranges, permissions, calculations, and source metadata. Mock external providers. Run tests, type checking, lint, and build. Report whether data is manual or API-synced. Do not commit, push, merge, or change live campaigns without approval. Stop after Module 29.
---
Module 30 — Support & Maintenance
Copy/paste prompt:
Implement Module 30: Support & Maintenance only, checking whether a support-ticket system already exists.
Requirements:
Track support tickets with reference number, requester/client, subject, description, category, priority, status, assignee, timestamps, and permitted attachments.
Support authorized creation, assignment, replies/notes, status transitions, search, and filtering.
Separate internal notes from messages visible to clients.
Enforce client/employee access on the server and prevent users from viewing other clients' tickets.
Add SLA fields or reminders only when the business has defined the policy. Do not invent response-time promises.
Reuse notifications and documents modules where implemented; do not fake email delivery.
Preserve ticket history as required.
Branch: `feature/m30-support-maintenance`. Add Jest + Supertest tests for ticket CRUD, visibility, internal-note privacy, status transitions, assignment permissions, and validation. Run tests, type checking, lint, and build. Report unresolved support policy decisions. Do not commit, push, or merge without approval. Stop after Module 30.
---
Module 31 — Client Portal
Copy/paste prompt:
Implement Module 31: Client Portal only after inspecting authentication and client-record relationships. Treat this as a separate client-facing access surface, not merely a hidden internal dashboard.
Requirements:
Define a safe client identity/account relationship and a restricted client role/permission set.
Allow authenticated clients to see only their own permitted projects, deliverables, quotations, invoices, support tickets, and documents when those modules exist.
Never expose internal notes, staff-only data, other clients' records, internal audit logs, or unauthorized financial/HR data.
Protect login/session/token handling using the existing authentication design. Do not create a bypass around internal authorization.
Validate all client-submitted comments, approvals, requests, and uploads.
Provide appropriate empty, loading, error, and access-denied UI states.
If the current authentication architecture cannot safely support client accounts, report the design blocker before making risky changes.
Branch: `feature/m31-client-portal`. Add Jest + Supertest tests for client isolation across every exposed resource, unauthorized access, IDOR attempts, approvals/comments, and sensitive-field exclusion. Run tests, type checking, lint, and build. Do not claim the portal is secure without tests. Do not commit, push, merge, or publish without approval. Stop after Module 31.
---
Module 32 — Quality Assurance
Copy/paste prompt:
Implement Module 32: Quality Assurance only if a QA workflow is required. Inspect projects, tasks, deliverables, and support tickets first.
Requirements:
Track QA checks, test cases/checklists, outcomes, defects, severity, assigned tester, related project/deliverable, and retest status as appropriate.
Avoid duplicating task or ticket functionality; link defects to existing records when possible.
Support documented status transitions and role-based assignment/approval.
Preserve test results and defect history.
Do not claim automated test execution occurred unless a test runner actually produced a result. Keep manual QA records clearly labeled as manual.
Add dashboards only from actual QA records and provide filters for project, status, severity, and assignee.
Branch: `feature/m32-quality-assurance`. Add Jest + Supertest tests for record CRUD, validation, transitions, permissions, and relationship integrity. Run tests, type checking, lint, and build. Report which QA steps are system-enforced and which remain manual. Do not commit, push, or merge without approval. Stop after Module 32.
---
Module 33 — Time Tracking
Copy/paste prompt:
Implement Module 33: Time Tracking only if approved by business requirements. Inspect tasks, projects, and user permissions first.
Requirements:
Record time entries linked to a user and optionally a task/project/client, with start/end or duration, date, description, and billable status only when applicable.
Validate positive durations, timestamps, time zones, and allowed edits.
Prevent duplicate active timers or overlapping entries if a timer feature is implemented.
Enforce users' access to their own time records and managers' access only as permitted.
Calculate totals on the server and document rounding rules.
Keep billable time separate from invoice generation unless the invoicing rules are explicitly defined.
Do not monitor users secretly or collect unnecessary activity data.
Branch: `feature/m33-time-tracking`. Add Jest + Supertest tests for duration calculations, invalid/overlapping entries, permissions, timer state if implemented, and date/time boundaries. Run tests, type checking, lint, and build. Report unresolved billing/policy decisions. Do not commit, push, or merge without approval. Stop after Module 33.
---
Module 34 — Workload & Capacity
Copy/paste prompt:
Implement Module 34: Workload & Capacity only after inspecting employee/user, project, task, and time-tracking data.
Requirements:
Provide a workload view based on actual assignments, due dates, and capacity values that have been explicitly configured.
Avoid inventing employee working hours, capacity limits, productivity scores, or availability.
Show task counts and time estimates only when real fields exist; distinguish estimated workload from tracked time.
Restrict manager/team views according to role permissions.
Use efficient queries and clear date-range filters.
If capacity configuration or time estimates do not exist, identify the prerequisite and implement only what can be supported accurately.
Branch: `feature/m34-workload-capacity`. Add Jest + Supertest tests for aggregation calculations, date filters, permissions, and behavior with missing estimates/capacity. Run tests, type checking, lint, and build. Report assumptions and blockers. Do not commit, push, or merge without approval. Stop after Module 34.
---
Module 35 — Recruitment
Copy/paste prompt:
Implement Module 35: Recruitment only if recruitment is a confirmed requirement. Inspect the repository and avoid collecting unnecessary applicant data.
If needed:
Track job openings, candidates, applications, stages, interview schedules, and internal notes with role-based access.
Validate candidate details and keep applicant documents private.
Prevent unauthorized users from accessing candidate profiles or interview feedback.
Define stages and retention rules from approved company policy; do not invent hiring policies or legal obligations.
Avoid exposing applicant data in general dashboards, logs, or exports.
Reuse secure document storage if attachments are required.
If no requirement or policy is available, document the module as optional and do not implement speculative workflows.
Branch: `feature/m35-recruitment`. Add Jest + Supertest tests for permissions, candidate CRUD, stage transitions, file access, validation, and sensitive-data exposure. Run tests, type checking, lint, and build. Report policy decisions still needed. Do not commit, push, merge, or contact applicants without approval. Stop after Module 35.
---
Module 36 — Knowledge Base
Copy/paste prompt:
Implement Module 36: Knowledge Base only if the application needs internal or client-facing documentation.
Requirements:
Support articles with title, body, category, tags, status/draft/published state, author, timestamps, and visibility scope.
Enforce different visibility for internal-only and client-visible articles.
Validate and safely render article content to prevent stored XSS.
Support search, filtering, and pagination without exposing drafts to unauthorized users.
Track revisions or update history if the current architecture supports it.
Do not publish company-sensitive information publicly by default.
Reuse the current UI and permissions system.
Branch: `feature/m36-knowledge-base`. Add Jest + Supertest tests for article CRUD, draft/published visibility, internal/client access, validation, safe content handling, and search. Run tests, type checking, lint, and build. Report visibility behavior. Do not commit, push, or publish externally without approval. Stop after Module 36.
---
Module 37 — Integrations
Copy/paste prompt:
Implement Module 37: Integrations only. Inspect existing providers, environment variables, and integration code first.
Requirements:
Create a consistent integration boundary/service pattern for actual required providers, rather than adding integrations merely because they are possible.
Store credentials using environment variables or an approved secret manager; never return credentials to the frontend or log them.
Validate webhooks, signatures, timestamps, and replay protection where the provider supports them.
Handle timeouts, retries, provider errors, rate limits, and idempotency safely.
Mock external providers in automated tests and document manual configuration.
Do not claim an integration is live until a real authorized connection has been configured and verified.
Do not connect to, read from, or modify a user's external account without permission.
Branch: `feature/m37-integrations`. Add Jest + Supertest tests for validation, signature failures, duplicate webhook delivery, provider errors/timeouts, and secret redaction. Run tests, type checking, lint, and build. List each implemented provider and label it as mocked/configured/verified accurately. Do not commit, push, merge, or alter external accounts without approval. Stop after Module 37.
---
Module 38 — Data Import/Export
Copy/paste prompt:
Implement Module 38: Data Import/Export only, with strong authorization and validation.
Requirements:
Support import/export for explicitly approved entities and formats, such as CSV or JSON, using existing models and schemas.
Validate file type, size, columns, field values, encoding, and row limits. Reject malformed or unsupported data safely.
Provide a dry-run/preview or validation report before committing imports where feasible.
Make imports transactional or safely recoverable where possible; report row-level failures without silently corrupting data.
Prevent unauthorized export of financial, HR, client, or other restricted fields.
Protect against CSV formula injection when exporting spreadsheet-compatible files.
Do not import arbitrary executable content or trust client-supplied IDs/roles.
Never run destructive imports or overwrite existing records silently.
Branch: `feature/m38-data-import-export`. Add Jest + Supertest tests for malformed files, validation failures, permissions, row errors, duplicate handling, export redaction, and CSV formula safety. Use isolated test data. Run tests, type checking, lint, and build. Report limits and supported formats. Do not commit, push, or run bulk production imports/exports without approval. Stop after Module 38.
---
Module 39 — Backup & Recovery
Copy/paste prompt:
Implement Module 39: Backup & Recovery only after inspecting the actual database, hosting platform, storage provider, and operational requirements.
Requirements:
Document or implement a backup procedure appropriate to the actual MongoDB deployment and file storage.
Protect backup files with access control and encryption where supported; do not expose backups through public static routes.
Keep credentials out of code and logs.
Define backup frequency, retention, recovery objectives, and responsible roles only from approved requirements. If they are unknown, list them as decisions required.
Provide a restore procedure and verify it against an isolated test environment before claiming recovery works.
Avoid destructive restore commands on a live or development database without explicit approval.
Do not claim backups are running unless scheduling and successful execution have been verified.
Branch: `feature/m39-backup-recovery`. Add automated tests for backup/restore orchestration and error handling where practical, using mocks or an isolated database. Run tests, type checking, lint, and build. Report what is implemented, what was actually tested, and what requires hosting-level configuration. Do not run a live restore, commit, push, or merge without approval. Stop after Module 39.
---
Module 40 — System Monitoring
Copy/paste prompt:
Implement Module 40: System Monitoring only, using the existing deployment and logging setup.
Requirements:
Provide a safe health/readiness check appropriate to the application without revealing secrets, connection strings, internal paths, or sensitive infrastructure details.
Add structured logs and error monitoring integration only if an approved provider is configured.
Avoid logging tokens, passwords, private client data, or full request bodies.
Track useful operational signals such as request failures and latency only where supported.
Apply access control or minimal output to detailed diagnostics; public health endpoints must not expose internals.
Configure alerts only when an actual notification channel and thresholds are agreed.
Do not claim monitoring/alerts are active unless the service is configured and verified.
Branch: `feature/m40-system-monitoring`. Add Jest + Supertest tests for health/readiness behavior, safe responses, failure handling, and secret redaction. Run tests, type checking, lint, and build. Report configured versus merely documented monitoring. Do not commit, push, merge, or alter production monitoring without approval. Stop after Module 40.
---
Module 41 — Privacy & Data Retention
Copy/paste prompt:
Implement Module 41: Privacy & Data Retention only after inspecting current data models, logs, document storage, backup policy, and approved company requirements.
Requirements:
Inventory the categories of personal and sensitive data stored by the CRM.
Define data-access, correction, export, deletion/anonymization, and retention behavior only in line with approved business/legal requirements.
Ensure deletion/anonymization does not silently break financial records, audit history, contracts, or required business references.
Restrict personal data in logs, reports, exports, and notifications.
Apply retention to backups and files only where it can be implemented safely and consistently.
Document data flows and retention configuration.
Do not claim legal compliance or invent jurisdiction-specific requirements. Escalate unclear policy/legal questions for human review.
Branch: `feature/m41-privacy-data-retention`. Add Jest + Supertest tests for authorization, redaction, export/deletion/anonymization behavior where implemented, and protection of required linked records. Run tests, type checking, lint, and build. Report the policy assumptions and unresolved legal/business decisions. Do not commit, push, or execute bulk deletion without approval. Stop after Module 41.
---
Module 42 — Workflow Automation
Copy/paste prompt:
Implement Module 42: Workflow Automation only after inspecting existing events, notifications, task assignment, and integration services.
Requirements:
Support only clearly defined, authorized automation rules with a trigger, conditions, and actions.
Validate rule configuration and prevent unsafe arbitrary code execution, shell commands, or unrestricted dynamic evaluation.
Make rule execution idempotent where possible and protect against recursive loops, duplicate events, and runaway execution.
Record execution status and safe diagnostic information; do not log secrets or sensitive payloads.
Use queues/schedulers only if available and configured safely. Do not claim scheduled jobs run when no scheduler is configured.
Restrict who can create, enable, disable, and inspect automation rules.
Start with a small, explicit set of supported triggers/actions; do not build an unrestricted automation engine.
Branch: `feature/m42-workflow-automation`. Add Jest + Supertest tests for rule validation, authorization, duplicate events, loop prevention, action failures, and idempotency. Mock external services. Run tests, type checking, lint, and build. Report supported triggers/actions and any scheduler setup required. Do not commit, push, merge, or enable production automations without approval. Stop after Module 42.
---
Module 43 — Customer Feedback
Copy/paste prompt:
Implement Module 43: Customer Feedback only if it fits the confirmed client workflow.
Requirements:
Capture feedback linked to an authenticated client and/or an authorized project, deliverable, or support ticket.
Validate ratings and text length and prevent unauthorized users from submitting feedback for other clients' work.
Support internal review and response states only where required.
Restrict visibility of feedback and internal notes according to approved permissions.
Avoid collecting unnecessary personal data and avoid making feedback public by default.
Calculate summary ratings only from actual feedback and document how incomplete or duplicate submissions are handled.
Do not fabricate customer feedback, ratings, or testimonials.
Branch: `feature/m43-customer-feedback`. Add Jest + Supertest tests for validation, client ownership, duplicate submissions if restricted, permissions, safe display, and rating calculations. Run tests, type checking, lint, and build. Report results and unresolved feedback-policy decisions. Do not commit, push, merge, or publish testimonials without approval. Stop after Module 43.
---
Module 44 — Business Continuity
Copy/paste prompt:
Implement Module 44: Business Continuity only after reviewing the actual architecture, hosting, database/storage, backup/recovery plan, monitoring, and operational requirements.
Requirements:
Document realistic recovery and continuity procedures for the current system.
Identify critical dependencies, failure scenarios, recovery steps, ownership, and communication responsibilities only from confirmed information.
Link to the actual backup/recovery and monitoring capabilities; do not duplicate their implementation.
Define recovery time and recovery point objectives only after business approval.
Include a safe incident-response checklist for application/database outage, credential compromise, failed deployment, data corruption, and external-provider outage where relevant.
Ensure procedures do not expose secrets and clearly distinguish tested procedures from proposed procedures.
Run a recovery drill only in a non-production environment and only with approval. Never simulate disaster recovery by deleting live data.
Do not claim business continuity is guaranteed or tested unless evidence exists.
Branch: `feature/m44-business-continuity`. Add automated tests for any implemented application-level recovery/status logic where practical. Run tests, type checking, lint, and build. Report documentation delivered, drills actually performed, untested assumptions, and remaining risks. Do not commit, push, merge, deploy, or run a live recovery exercise without approval. Stop after Module 44.
---
Final implementation checklist
Use this checklist at the end of each module:
[ ] Correct module number and name confirmed.
[ ] Existing repository and Git status inspected.
[ ] Current architecture and stack preserved.
[ ] Only the current module was implemented.
[ ] Authentication and server-side authorization enforced.
[ ] Validation, safe errors, and sensitive-data handling reviewed.
[ ] Database changes are safe and do not wipe existing data.
[ ] Jest + Supertest automated tests added/updated.
[ ] Tests run against an isolated test database.
[ ] Type checking, lint, and build run when available.
[ ] Actual PASS/FAIL/NOT RUN results recorded honestly.
[ ] Remaining blockers and manual configuration documented.
[ ] No commit/push/merge/deployment occurred without approval.
[ ] Antigravity stopped without starting the next module.
Important usage note
This roadmap is sequential, but not every proposed module is necessarily required by the company. Before optional HR, recruitment, marketing, SEO, social publishing, advertising, or automation functionality is implemented, confirm the actual requirement. Some modules depend on earlier ones. If a prerequisite is missing, Antigravity must report the blocker instead of inventing data, duplicating a feature, or pretending an integration exists.
Work one module at a time. Review the implementation and test report before moving to the next module.