"use client";

import { useState, useTransition, useMemo } from "react";
import { UserRole, UserStatus } from "@prisma/client";
import {
  createUserAdminAction,
  deleteUserAdminAction,
  updateUserRoleAndStatusAction,
  resetUserPasswordAdminAction,
  CreateUserInput,
} from "@/actions/admin";
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  _count?: {
    listings: number;
  };
}

interface UserManagementTabProps {
  initialUsers: SerializedUser[];
  currentUserId?: string;
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    badgeClass: string;
    icon: typeof Shield;
  }
> = {
  admin: {
    label: "Administrator",
    description: "Full system control, settings, user management, and moderation.",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: ShieldCheck,
  },
  moderator: {
    label: "Moderator",
    description: "Review approvals, listing claims, and content moderation.",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: ShieldAlert,
  },
  owner: {
    label: "Business Owner",
    description: "Can submit, manage, and claim business listings.",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Building2,
  },
  visitor: {
    label: "Community Member",
    description: "Standard registered user who can review, rate, and save favourites.",
    badgeClass: "bg-muted text-muted-foreground border-border",
    icon: User,
  },
};

function generateRandomPassword(length = 14): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?";
  let pass = "";
  const cryptoObj = typeof window !== "undefined" && window.crypto ? window.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      const val = values[i] ?? 0;
      pass += chars[val % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return pass;
}

export function UserManagementTab({ initialUsers, currentUserId }: UserManagementTabProps) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New user form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserRole>(UserRole.owner);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Reset password modal state
  const [resetUser, setResetUser] = useState<SerializedUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [copiedResetPassword, setCopiedResetPassword] = useState(false);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === UserRole.admin).length;
    const owners = users.filter((u) => u.role === UserRole.owner).length;
    const moderators = users.filter((u) => u.role === UserRole.moderator).length;
    const visitors = users.filter((u) => u.role === UserRole.visitor).length;
    return { total, admins, owners, moderators, visitors };
  }, [users]);

  // Handle password generation
  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    setFormPassword(newPass);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!formPassword) return;
    navigator.clipboard.writeText(formPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Reset Add Form
  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormRole(UserRole.owner);
    setShowPassword(false);
  };

  // Create User Submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formName.trim()) {
      setStatusMessage({ type: "error", text: "Full Name is compulsory." });
      return;
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      setStatusMessage({ type: "error", text: "A valid Email Address is compulsory." });
      return;
    }
    if (!formPassword.trim() || formPassword.length < 6) {
      setStatusMessage({
        type: "error",
        text: "Password is compulsory and must be at least 6 characters.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createUserAdminAction({
        name: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone || undefined,
        role: formRole,
      });

      if (res.success && res.user) {
        setUsers((prev) => [res.user as SerializedUser, ...prev]);
        setStatusMessage({
          type: "success",
          text: `User account for "${res.user.name}" (${res.user.email}) created successfully with role ${res.user.role.toUpperCase()}.`,
        });
        resetForm();
        setIsAddModalOpen(false);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to create user. Please try again.",
        });
      }
    });
  };

  // Delete User
  const handleDeleteUser = (user: SerializedUser) => {
    if (user.id === currentUserId) {
      alert("You cannot delete your own logged-in administrator account.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete user "${user.name}" (${user.email})?\n\nThis will remove their account and clear active sessions.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteUserAdminAction(user.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setStatusMessage({
          type: "success",
          text: `User "${user.name}" was successfully deleted.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to delete user.",
        });
      }
    });
  };

  // Change Role or Status
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await updateUserRoleAndStatusAction(userId, { role: newRole });
      if (res.success && res.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setStatusMessage({
          type: "success",
          text: `Updated role for user to ${newRole.toUpperCase()}.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update role.",
        });
      }
    });
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    startTransition(async () => {
      const res = await updateUserRoleAndStatusAction(userId, { status: newStatus });
      if (res.success && res.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        setStatusMessage({
          type: "success",
          text: `User status changed to ${newStatus.toUpperCase()}.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update status.",
        });
      }
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setStatusMessage(null);

    if (!resetPassword.trim() || resetPassword.length < 6) {
      setStatusMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    startTransition(async () => {
      const res = await resetUserPasswordAdminAction(resetUser.id, resetPassword);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || `Password for ${resetUser.name} was successfully reset.`,
        });
        setResetUser(null);
        setResetPassword("");
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to reset password.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          role="alert"
          className={`rounded-2xl p-4 flex items-start gap-3 border shadow-sm transition-all duration-200 animate-in fade-in-50 ${
            statusMessage.type === "success"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {statusMessage.text}
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Total Accounts</span>
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Administrators</span>
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 font-mono tabular-nums">
            {stats.admins}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Business Owners</span>
            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {stats.owners}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Members & Mods</span>
            <User className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono tabular-nums">
            {stats.moderators + stats.visitors}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Role Filter, and Add User Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value={UserRole.admin}>Admins ({stats.admins})</option>
            <option value={UserRole.moderator}>Moderators ({stats.moderators})</option>
            <option value={UserRole.owner}>Business Owners ({stats.owners})</option>
            <option value={UserRole.visitor}>Community ({stats.visitors})</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* User Records Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">User & Contact</th>
                <th className="py-3 px-4">Privilege Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Listings</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No users found matching your search</p>
                    <p className="text-[11px] mt-0.5">Try a different search query or role filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.visitor;
                  const isSelf = user.id === currentUserId;
                  const initials = user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground truncate">
                                {user.name}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 shrink-0" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="hidden sm:flex items-center gap-1 truncate">
                                  • <Phone className="h-3 w-3 shrink-0" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Privilege Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={user.role}
                            disabled={isPending || isSelf}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as UserRole)
                            }
                            className={`rounded-lg border px-2 py-1 text-[11px] font-bold focus:outline-none transition ${roleMeta.badgeClass} disabled:opacity-80 cursor-pointer`}
                          >
                            <option value={UserRole.admin}>Administrator</option>
                            <option value={UserRole.moderator}>Moderator</option>
                            <option value={UserRole.owner}>Business Owner</option>
                            <option value={UserRole.visitor}>Community Visitor</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={user.status}
                          disabled={isPending || isSelf}
                          onChange={(e) =>
                            handleStatusChange(user.id, e.target.value as UserStatus)
                          }
                          className={`rounded-lg border px-2 py-1 text-[11px] font-bold focus:outline-none transition cursor-pointer disabled:opacity-80 ${
                            user.status === UserStatus.active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : user.status === UserStatus.suspended
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
                          }`}
                        >
                          <option value={UserStatus.active}>● Active</option>
                          <option value={UserStatus.suspended}>▲ Suspended</option>
                          <option value={UserStatus.locked}>■ Locked</option>
                        </select>
                      </td>

                      {/* Listing Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono tabular-nums text-foreground font-semibold">
                          {user._count?.listings ?? 0}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px] font-mono tabular-nums">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Reset / Change Password Action */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setResetUser(user);
                              const newPass = generateRandomPassword();
                              setResetPassword(newPass);
                              setShowResetPassword(true);
                            }}
                            title={`Reset Password for ${user.name}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {/* Delete Account Action */}
                          <button
                            type="button"
                            disabled={isPending || isSelf}
                            onClick={() => handleDeleteUser(user)}
                            title={isSelf ? "Cannot delete your own account" : "Delete User"}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Create User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
          <div
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Create New User Account
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Register a new user, assign their directory role, and set initial password.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Name (Compulsory) */}
              <div>
                <label
                  htmlFor="userName"
                  className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
                >
                  <span>Full Name</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
                    * Compulsory
                  </span>
                </label>
                <input
                  id="userName"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Email (Compulsory) */}
              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
                >
                  <span>Email Address</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
                    * Compulsory
                  </span>
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Password (Compulsory) + Generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="userPassword"
                    className="text-xs font-bold text-foreground flex items-center gap-1.5"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span>Password</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10 ml-1">
                      * Compulsory
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="userPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter or generate a strong password (min 6 characters)"
                    className="w-full rounded-xl border border-border bg-background pl-3.5 pr-20 py-2.5 text-xs font-mono font-medium text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {formPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title="Copy password to clipboard"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      >
                        {copiedPassword ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  The user can use this password to log in immediately and manage their listings.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="userRole"
                  className="block text-xs font-bold text-foreground mb-1.5"
                >
                  System Role & Privileges
                </label>
                <select
                  id="userRole"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  <option value={UserRole.owner}>
                    Business Owner (Can create, manage, and claim listings)
                  </option>
                  <option value={UserRole.moderator}>
                    Moderator (Review and claim verification privileges)
                  </option>
                  <option value={UserRole.admin}>
                    Administrator (Full dashboard, settings & user control)
                  </option>
                  <option value={UserRole.visitor}>
                    Community Visitor (Can rate, review, and save listings)
                  </option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {ROLE_CONFIG[formRole]?.description}
                </p>
              </div>

              {/* Phone (Optional) */}
              <div>
                <label
                  htmlFor="userPhone"
                  className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
                >
                  <span>Phone Number</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>
                <input
                  id="userPhone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isPending}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset / Edit Password */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Reset User Password
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Admin security override for {resetUser.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="rounded-xl p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                <span className="font-semibold text-foreground truncate">{resetUser.name}</span>
                <span className="font-mono text-[11px] truncate">{resetUser.email}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="resetNewPassword"
                    className="text-xs font-bold text-foreground flex items-center gap-1.5"
                  >
                    <span>New Password</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
                      * Min 6 chars
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateRandomPassword();
                      setResetPassword(pass);
                      setShowResetPassword(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate New</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="resetNewPassword"
                    type={showResetPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter or generate strong password"
                    className="w-full rounded-xl border border-border bg-background pl-3.5 pr-20 py-2.5 text-xs font-mono font-medium text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {resetPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(resetPassword);
                          setCopiedResetPassword(true);
                          setTimeout(() => setCopiedResetPassword(false), 2000);
                        }}
                        title="Copy password"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      >
                        {copiedResetPassword ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      title={showResetPassword ? "Hide password" : "Show password"}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    >
                      {showResetPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  <strong>Security Notice:</strong> Setting a new password will terminate all active login sessions on other devices for this user.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  disabled={isPending}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

