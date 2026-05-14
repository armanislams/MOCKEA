import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  PiUsersThree,
  PiMagnifyingGlass,
  PiTrash,
  PiProhibit,
  PiCheckCircle,
  PiShieldStar,
  PiArrowClockwise,
  PiCaretDown,
  PiWarning,
  PiX,
} from "react-icons/pi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// ─── Utility ───────────────────────────────────────────────────────────────────

const ROLES = ["student", "admin", "instructor"];
const ROLE_COLORS = {
  admin: "badge-error",
  instructor: "badge-warning",
  student: "badge-info",
};

const PLAN_COLORS = {
  free: "badge-ghost",
  standard: "badge-success",
  premium: "badge-accent",
};

const roleIcon = (role) => {
  if (role === "admin") return "👑";
  if (role === "instructor") return "🛡️";
  return "🎓";
};

// ─── Confirm Modal ──────────────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, danger }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 shadow-2xl animate-fadeIn">
        <button className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={onClose}>
          <PiX className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className={`flex-none flex items-center justify-center w-12 h-12 rounded-full ${danger ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>
            <PiWarning className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-base-content/70 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            className={`btn btn-sm ${danger ? "btn-error" : "btn-warning"} text-white`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Role Dropdown ──────────────────────────────────────────────────────────────

const RoleDropdown = ({ user, onChangeRole, loading }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-xs gap-1 font-semibold"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        <span>{roleIcon(user.role)}</span>
        <span className={`badge badge-sm ${ROLE_COLORS[user.role] ?? "badge-ghost"}`}>
          {user.role}
        </span>
        <PiCaretDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 min-w-[120px] rounded-xl border border-base-300 bg-base-100 shadow-xl overflow-hidden">
          {ROLES.filter((r) => r !== user.role).map((r) => (
            <button
              key={r}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors"
              onClick={() => { onChangeRole(user._id, r); setOpen(false); }}
            >
              <span>{roleIcon(r)}</span>
              <span className={`badge badge-sm ${ROLE_COLORS[r]}`}>{r}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PlanDropdown = ({ user, onChangePlan, loading }) => {
  const [open, setOpen] = useState(false);
  const PLANS = ["free", "standard", "premium"];

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-xs gap-1 font-semibold"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        <span className={`badge badge-sm ${PLAN_COLORS[user.plan] ?? "badge-ghost"}`}>
          {user.plan}
        </span>
        <PiCaretDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 min-w-[120px] rounded-xl border border-base-300 bg-base-100 shadow-xl overflow-hidden">
          {PLANS.filter((p) => p !== user.plan).map((p) => (
            <button
              key={p}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors"
              onClick={() => {
                onChangePlan(user._id, p);
                setOpen(false);
              }}
            >
              <span className={`badge badge-sm ${PLAN_COLORS[p]}`}>{p}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── User Row ───────────────────────────────────────────────────────────────────

const UserRow = ({ user, onChangeRole, onChangePlan, onDelete, onToggleBan, loadingId }) => {
  const isLoading = loadingId === user._id;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <tr className={`group transition-colors hover:bg-base-200/50 ${user.isBanned ? "opacity-60" : ""}`}>
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold">
              <span>{user.name?.[0]?.toUpperCase() ?? "?"}</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">{user.name}</p>
            <p className="text-xs text-base-content/50 mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="py-3">
        <RoleDropdown user={user} onChangeRole={onChangeRole} loading={isLoading} />
      </td>

      <td className="py-3 hidden sm:table-cell">
        <PlanDropdown
          user={user}
          onChangePlan={onChangePlan}
          loading={isLoading}
        />
      </td>

      <td className="py-3 hidden md:table-cell">
        {user.isBanned ? (
          <span className="badge badge-sm badge-error gap-1">
            <PiProhibit className="w-3 h-3" /> Banned
          </span>
        ) : (
          <span className="badge badge-sm badge-success gap-1">
            <PiCheckCircle className="w-3 h-3" /> Active
          </span>
        )}
      </td>

      <td className="py-3 hidden lg:table-cell">
        <span className="text-xs text-base-content/60">{joinDate}</span>
      </td>

      <td className="py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className={`btn btn-ghost btn-xs tooltip ${user.isBanned ? "text-success" : "text-warning"}`}
            data-tip={user.isBanned ? "Unban" : "Ban"}
            onClick={() => onToggleBan(user)}
            disabled={isLoading}
          >
            {user.isBanned ? <PiCheckCircle className="w-4 h-4" /> : <PiProhibit className="w-4 h-4" />}
          </button>
          <button
            className="btn btn-ghost btn-xs text-error tooltip"
            data-tip="Delete"
            onClick={() => onDelete(user)}
            disabled={isLoading}
          >
            <PiTrash className="w-4 h-4" />
          </button>
        </div>
        {isLoading && <span className="loading loading-spinner loading-xs text-primary" />}
      </td>
    </tr>
  );
};

// ─── Stats Bar ──────────────────────────────────────────────────────────────────

const StatsBar = ({ users }) => {
  const total = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const banned = users.filter((u) => u.isBanned).length;
  const standard = users.filter((u) => u.plan !== "free").length;

  const stats = [
    { label: "Total Users", value: total, icon: "👥", color: "text-primary" },
    { label: "Admins", value: admins, icon: "👑", color: "text-error" },
    { label: "Banned", value: banned, icon: "🚫", color: "text-warning" },
    { label: "Standard / Premium", value: standard, icon: "⭐", color: "text-success" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="card bg-base-100 border border-base-300 shadow-sm p-4 flex-row items-center gap-3">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-base-content/60">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Confirm modal state ───────────────────────────────────────────────────────
  const [modal, setModal] = useState({
    isOpen: false, title: "", message: "", confirmLabel: "", danger: false, onConfirm: () => {},
  });
  const openModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal((m) => ({ ...m, isOpen: false }));

  // ── useQuery: fetch all users (cached, auto-refetch on mount) ────────────────
  const {
    data: allUsers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/user/all");
      return res.data.users ?? [];
    },
    staleTime: 1000 * 60 * 2,       // cache fresh for 2 minutes
    gcTime: 1000 * 60 * 10,          // keep in memory for 10 minutes
    retry: 2,
    onError: () => toast.error("Failed to load users"),
  });

  // ── useMutation: change role ──────────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => axiosSecure.patch(`/user/${id}/role`, { role }),
    onMutate: async ({ id, role }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData(["admin-users"]);
      queryClient.setQueryData(["admin-users"], (old) =>
        old.map((u) => (u._id === id ? { ...u, role } : u))
      );
      return { previous };
    },
    onSuccess: (_, { role }) => toast.success(`Role updated to ${role}`),
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["admin-users"], ctx.previous);
      toast.error("Failed to update role");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setLoadingId(null);
    },
  });

  // ── useMutation: toggle ban ───────────────────────────────────────────────────
  const banMutation = useMutation({
    mutationFn: ({ id }) => axiosSecure.patch(`/user/${id}/ban`),
    onMutate: async ({ id, isBanned }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData(["admin-users"]);
      queryClient.setQueryData(["admin-users"], (old) =>
        old.map((u) => (u._id === id ? { ...u, isBanned: !isBanned } : u))
      );
      return { previous };
    },
    onSuccess: (_, { isBanned }) =>
      toast.success(isBanned ? "User unbanned" : "User banned"),
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["admin-users"], ctx.previous);
      toast.error("Failed to update ban status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setLoadingId(null);
    },
  });

  // ── useMutation: change plan ──────────────────────────────────────────────────
  const planMutation = useMutation({
    mutationFn: ({ id, plan }) => axiosSecure.patch(`/user/${id}/plan`, { plan }),
    onMutate: async ({ id, plan }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData(["admin-users"]);
      queryClient.setQueryData(["admin-users"], (old) =>
        old.map((u) => (u._id === id ? { ...u, plan } : u))
      );
      return { previous };
    },
    onSuccess: (_, { plan }) => toast.success(`Plan updated to ${plan}`),
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["admin-users"], ctx.previous);
      toast.error("Failed to update plan");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setLoadingId(null);
    },
  });

  // ── useMutation: delete user ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: ({ id }) => axiosSecure.delete(`/user/${id}`),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData(["admin-users"]);
      queryClient.setQueryData(["admin-users"], (old) =>
        old.filter((u) => u._id !== id)
      );
      return { previous };
    },
    onSuccess: () => toast.success("User deleted"),
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["admin-users"], ctx.previous);
      toast.error("Failed to delete user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setLoadingId(null);
    },
  });

  // ── Client-side filtering (derived via useMemo) ───────────────────────────────
  const users = useMemo(() => {
    let filtered = [...allUsers];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
    if (planFilter !== "all") filtered = filtered.filter((u) => u.plan === planFilter);
    if (statusFilter === "banned") filtered = filtered.filter((u) => u.isBanned);
    if (statusFilter === "active") filtered = filtered.filter((u) => !u.isBanned);
    return filtered;
  }, [allUsers, search, roleFilter, planFilter, statusFilter]);

  // ── Action handlers (open confirm modal, then fire mutation) ──────────────────
  const handleChangeRole = (id, newRole) => {
    openModal({
      title: "Change User Role",
      message: `Are you sure you want to set this user's role to "${newRole}"?`,
      confirmLabel: "Yes, Change Role",
      danger: false,
      onConfirm: () => { setLoadingId(id); roleMutation.mutate({ id, role: newRole }); },
    });
  };

  const handleChangePlan = (id, newPlan) => {
    openModal({
      title: "Change User Plan",
      message: `Are you sure you want to upgrade/change this user's plan to "${newPlan}"?`,
      confirmLabel: "Yes, Change Plan",
      danger: false,
      onConfirm: () => {
        setLoadingId(id);
        planMutation.mutate({ id, plan: newPlan });
      },
    });
  };

  const handleToggleBan = (user) => {
    const banning = !user.isBanned;
    openModal({
      title: banning ? "Ban User" : "Unban User",
      message: banning
        ? `You are about to ban "${user.name}". They will lose access to the platform.`
        : `You are about to unban "${user.name}". They will regain access.`,
      confirmLabel: banning ? "Yes, Ban" : "Yes, Unban",
      danger: banning,
      onConfirm: () => { setLoadingId(user._id); banMutation.mutate({ id: user._id, isBanned: user.isBanned }); },
    });
  };

  const handleDelete = (user) => {
    openModal({
      title: "Delete User",
      message: `This will permanently delete "${user.name}" (${user.email}). This action cannot be undone.`,
      confirmLabel: "Delete Permanently",
      danger: true,
      onConfirm: () => { setLoadingId(user._id); deleteMutation.mutate({ id: user._id }); },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
              Administration
            </p>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <PiUsersThree className="text-primary" />
              Manage Users
            </h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Control roles, access, and account status across the platform.
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <PiArrowClockwise className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <StatsBar users={allUsers} />

        {/* Filters */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-[180px]">
              <PiMagnifyingGlass className="w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="grow bg-transparent outline-none"
              />
            </label>

            <select
              className="select select-bordered select-sm min-w-[120px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">{r}</option>
              ))}
            </select>

            <select
              className="select select-bordered select-sm min-w-[120px]"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>

            <select
              className="select select-bordered select-sm min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-base-content/50">
              <span className="loading loading-spinner loading-md text-primary" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/40">
              <p className="font-medium text-error">Failed to load users</p>
              <button className="btn btn-sm btn-outline" onClick={() => refetch()}>
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-base-content/40">
              <PiUsersThree className="w-12 h-12" />
              <p className="font-medium">No users found</p>
              <p className="text-xs">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/70">
                  <tr>
                    <th className="pl-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider">User</th>
                    <th className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Role</th>
                    <th className="text-xs font-semibold text-base-content/60 uppercase tracking-wider hidden sm:table-cell">Plan</th>
                    <th className="text-xs font-semibold text-base-content/60 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="text-xs font-semibold text-base-content/60 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="pr-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {users.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onChangeRole={handleChangeRole}
                      onChangePlan={handleChangePlan}
                      onDelete={handleDelete}
                      onToggleBan={handleToggleBan}
                      loadingId={loadingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!isLoading && !isError && users.length > 0 && (
            <div className="flex items-center justify-between border-t border-base-200 px-4 py-3 text-xs text-base-content/50">
              <span>
                Showing <span className="font-medium text-base-content">{users.length}</span> of{" "}
                <span className="font-medium text-base-content">{allUsers.length}</span> users
              </span>
              <div className="flex items-center gap-1">
                <PiShieldStar className="w-3 h-3 text-primary" />
                <span>Admin Panel</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
