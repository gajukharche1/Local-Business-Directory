# User Management, Admin Privileges & Collapsible Sidebar Plan

## 1. Executive Summary & Core Objectives
In branch `user-management`, we implement five interconnected capabilities adhering to `/design-system` and `/ui-skills`:
1. **User Dashboard Top-Right Profile & Admin Privileges Hub**:
   - High-fidelity profile capsule and popover dropdown in `app/(account)/dashboard/layout.tsx`.
   - Displays user identity, role, and explicit system privileges.
   - For Admins and Moderators, provides 1-click links to the Admin Console, Moderation Queue, Category Taxonomy, Location Engine, and Settings.
   - Includes a prominent, secure **Log Out** action.
2. **Admin Settings User Management Module**:
   - Integrated as a 5th tab into `app/(admin)/admin/settings/settings-form.tsx`.
   - Complete directory table of registered accounts with name, email, phone, role badges, status pills, listing counts, and joined dates.
   - Modal/dialog to **Add New User** with mandatory validation for `name`, `email`, and `password` (plus a secure random password generator and role selector).
3. **Admin Password Edit / Reset Capability**:
   - Administrators can reset/edit another user's password directly from the user table via a dedicated modal.
   - Includes a 1-click strong random password generator and copy button.
   - Upon resetting, the password hash is updated using Argon2id, and active sessions for the target user are automatically invalidated for security.
4. **User Status Lifecycle Management**:
   - Administrators can switch user statuses between `active`, `suspended`, and `locked` with immediate feedback.
5. **Collapsible Left Menu Sidebar**:
   - Upgraded both the Admin sidebar (`app/(admin)/admin/admin-sidebar.tsx`) and Dashboard sidebar (`components/dashboard/dashboard-sidebar.tsx`) to support smooth collapsible states (`w-64` expanded vs `w-20` compact/icon-only).
   - In collapsed mode, multi-level menus (Listing, Categories, Locations) provide sleek floating flyout menus with full navigation capabilities.
   - Persists state in `localStorage`.

---

## 2. Technical Design & Architecture

### A. Design System Tokens & Invariants (`/design-system` & `/ui-skills`)
- **Chrome Stability**: Header and navigation retain constant heights; collapsible transitions use compositor-friendly width transitions (`transition-[width] duration-200 ease-in-out`) without text wrapping layout shifts.
- **Surface Elevation**: Semantic tokens (`bg-card`, `border-border/70`, `text-foreground`, `shadow-xs`).
- **Interactive Feedback**: Hover states, active indicators, and keyboard accessible dropdown menus (`focus-visible`).
- **DOM Nesting Integrity**: The outer settings container is a semantic `div`, ensuring the site configuration `<form>` and modal `<form>` components never nest inside one another.

### B. Data & Security Architecture
- **User Actions** in `actions/admin.ts`:
  - `createUserAdminAction`: Enforces compulsory `name`, `email`, and `password` (min 6 chars, hashed with `@node-rs/argon2` via `hashPassword`).
  - `resetUserPasswordAdminAction`: Validates administrator privileges, hashes new password, updates target user, and purges `db.session` records for that user.
  - `updateUserRoleAndStatusAction`: Updates roles (`admin`, `moderator`, `owner`, `visitor`) and statuses (`active`, `suspended`, `locked`) while preventing self-demotion.
  - `deleteUserAdminAction`: Purges user sessions and account while preventing self-deletion.
- **Admin Privilege Mapping**:
  - `admin`: Full System Access (Governance, User Creation & Password Overrides, Pricing, Bulk Ingestion, Direct Publishing).
  - `moderator`: Content & Trust Ops (Review Approval, Claim Verification, Listing Status Updates).
  - `owner`: Merchant Scope (Claimed Storefronts, Lead Response, Hours & Photo Updates).
  - `visitor`: Community Scope (Search, Bookmark, Review Submission).

---

## 3. Next.js Version Upgrade Assessment
- **Current Version**: `15.5.28` (with Turbopack).
- **Available Updates**:
  - `15.5.29`: Recommended minor patch update (includes latest stability fixes and security backports without breaking changes).
  - `16.4.5`: Next.js 16 major upgrade (requires migrating async request APIs and validating all server actions and third-party dependencies).

---

## 4. Implementation Status
- [x] Create `components/dashboard/dashboard-user-menu.tsx` with user profile trigger, role badge, privilege list, quick admin navigation, and Sign Out.
- [x] Update `app/(account)/dashboard/layout.tsx` header to render the user menu in the top-right.
- [x] Add user management backend actions (`createUserAdminAction`, `resetUserPasswordAdminAction`, `updateUserRoleAndStatusAction`, `deleteUserAdminAction`) in `actions/admin.ts`.
- [x] Build `app/(admin)/admin/settings/user-management-tab.tsx` with search, filter, password reset modal, user creation modal, and status dropdown.
- [x] Integrate User Management tab into `app/(admin)/admin/settings/settings-form.tsx` and pass users from `app/(admin)/admin/settings/page.tsx`.
- [x] Fix DOM nesting error: separate Site Settings form from User Management dialog forms.
- [x] Build collapsible `AdminSidebar` and `DashboardSidebar` with floating flyout menus for collapsed submenus and `localStorage` persistence.
- [x] Pass `tsc --noEmit` and verify build compatibility.
