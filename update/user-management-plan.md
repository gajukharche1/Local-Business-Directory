# User Management, Admin Privileges & Collapsible Sidebar Plan

## 1. Executive Summary & Core Objectives
In branch `user-management`, we implement three interconnected capabilities adhering to `/design-system` and `/ui-skills`:
1. **User Dashboard Top-Right Profile & Admin Privileges Hub**:
   - Provide a top-right profile capsule and popover dropdown in `app/(account)/dashboard/layout.tsx`.
   - Displays current user identity, role, and explicit system privileges.
   - For Admins and Moderators, provides 1-click links to the Admin Console, Moderation Queue, Category Taxonomy, Location Engine, and Settings.
   - Includes a prominent, secure **Log Out** action.
2. **Admin Settings User Management Module**:
   - Integrate a dedicated **User Management** tab into `app/(admin)/admin/settings`.
   - Feature a directory list of registered accounts with name, email, role badges, and status pills.
   - Add a modal/form to **Add New User** with mandatory validation for `name`, `email`, and `password` (plus a secure random password generator and role selector).
   - Server actions for creating and managing users with Argon2 password hashing.
3. **Collapsible Left Menu Sidebar**:
   - Upgrade the sidebar in `app/(admin)/admin` (and `app/(account)/dashboard`) to support **Collapsible Sidebar** state (expanded `w-64` vs icon-only compact `w-20`).
   - Add a smooth toggle button with `PanelLeftClose` / `PanelLeftOpen` or `ChevronLeft` / `ChevronRight`.
   - Smooth CSS transitions (`transition-all duration-200 ease-out`), tooltips for icon-only mode, and layout stability adhering to `/design-system` chrome stability rules.

---

## 2. Technical Design & Architecture

### A. Design System Tokens & Invariants (`/design-system` & `/ui-skills`)
- **Chrome Stability**: Header and navigation retain constant heights; collapsible transitions use compositor-friendly width transitions without text wrapping layout shifts.
- **Surface Elevation**: Semantic tokens (`bg-card`, `border-border/70`, `text-foreground`, `shadow-xs`).
- **Interactive Feedback**: Hover states, active indicators, and keyboard accessible dropdown menus (`focus-visible`).

### B. Data & Security Architecture
- **User Creation Action**: `createUserAdminAction` in `actions/admin.ts`:
  - Enforces mandatory fields: `name` (min 2 chars), `email` (valid RFC format, case-insensitive uniqueness check), and `password` (min 8 chars, hashed with `@node-rs/argon2` via `hashPassword`).
  - Supports role assignment: `admin`, `moderator`, `business_owner`, `visitor`.
- **Admin Privilege Mapping**:
  - `admin`: Full System Access (Governance, User Creation, Pricing, Bulk Ingestion, Direct Publishing).
  - `moderator`: Content & Trust Ops (Review Approval, Claim Verification, Listing Status Updates).
  - `business_owner`: Merchant Scope (Claimed Storefronts, Lead Response, Hours & Photo Updates).
  - `visitor`: Consumer Scope (Search, Bookmark, Review Submission).

---

## 3. Implementation Checklist

### Phase 1: User Dashboard Top-Right Profile & Admin Privileges
- [ ] Create `components/dashboard/dashboard-user-menu.tsx` with user profile trigger, role badge, privilege list, quick admin navigation, and Sign Out.
- [ ] Update `app/(account)/dashboard/layout.tsx` header to render the user menu in the top-right.

### Phase 2: User Management in Admin Settings
- [ ] Add `createUserAdminAction` and `fetchUsersAdminAction` in `actions/admin.ts`.
- [ ] Create `app/(admin)/admin/settings/user-management-tab.tsx` featuring the users table, search filter, and "+ Add New User" modal with password generator.
- [ ] Integrate User Management tab into `app/(admin)/admin/settings/settings-form.tsx`.
- [ ] Update `app/(admin)/admin/settings/page.tsx` to pass initial user counts or user data.

### Phase 3: Collapsible Left Menu Sidebar
- [ ] Create a client-side collapsible sidebar wrapper `components/admin/collapsible-sidebar.tsx` or update `app/(admin)/admin/admin-nav.tsx` / `layout.tsx`.
- [ ] Support icon-only collapsed state with tooltip labels on hover.
- [ ] Ensure mobile responsive overlay behavior remains smooth and non-intrusive.

### Phase 4: Verification & Git Delivery
- [ ] Run `npx next build` to ensure 0 TypeScript and bundling errors.
- [ ] Commit all changes to branch `user-management`.
- [ ] Push branch to remote `origin user-management`.

