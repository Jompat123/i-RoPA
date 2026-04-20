"use client";

import { KeyRound, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminUserManagementData, AdminUserRole, AdminUserRow } from "@/types/admin";

type Props = { data: AdminUserManagementData };

type RoleApi = "ADMIN" | "VIEWER" | "DEPARTMENT_USER";

function toApiRole(role: AdminUserRole): RoleApi {
  if (role === "ADMIN") return "ADMIN";
  if (role === "DPO") return "VIEWER";
  return "DEPARTMENT_USER";
}

export function AdminUserManagementPage({ data }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(data.rows);
  const [search, setSearch] = useState(data.filters.q);
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>(data.filters.role);
  const [departmentFilter, setDepartmentFilter] = useState(data.filters.department);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DATA_OWNER" as AdminUserRole,
    department: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const byQ = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
      const byRole = roleFilter === "all" || r.role === roleFilter;
      const byDept = !departmentFilter || r.department === departmentFilter;
      return byQ && byRole && byDept;
    });
  }, [rows, search, roleFilter, departmentFilter]);

  async function patchUser(id: string, payload: Record<string, unknown>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "อัปเดตผู้ใช้ไม่สำเร็จ");
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleRoleChange(row: AdminUserRow, nextRole: AdminUserRole) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role: nextRole } : r)));
    await patchUser(row.id, { role: toApiRole(nextRole) });
  }

  async function handleResetPassword(row: AdminUserRow) {
    const generated = `${row.name.split(" ")[0].toLowerCase()}@1234`;
    await patchUser(row.id, { password: generated });
  }

  async function handleChangePassword(row: AdminUserRow) {
    const password = window.prompt(`ใส่รหัสผ่านใหม่ของ ${row.name}`);
    if (!password) return;
    await patchUser(row.id, { password });
  }

  async function handleCreateUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: toApiRole(form.role),
        departmentId: null,
      }),
    });
    if (!res.ok) return;
    const created = (await res.json()) as { id: string; name: string; email: string; role: string };
    setRows((prev) => [
      {
        id: created.id,
        name: created.name,
        email: created.email,
        role: form.role,
        department: form.department || "Unknown",
        status: "active",
      },
      ...prev,
    ]);
    setForm({ name: "", email: "", password: "", role: "DATA_OWNER", department: "" });
    setShowAdd(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {showAdd ? (
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:grid-cols-5">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as AdminUserRole }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="DATA_OWNER">Data Owner</option>
            <option value="DPO">DPO</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="button"
            onClick={handleCreateUser}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            เพิ่มไอดีผู้ใช้
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | AdminUserRole)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">Role</option>
            <option value="ADMIN">Admin</option>
            <option value="DPO">DPO</option>
            <option value="DATA_OWNER">Data Owner</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Department</option>
            {data.departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">User Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={row.role}
                      onChange={(e) => void handleRoleChange(row, e.target.value as AdminUserRole)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="DPO">DPO</option>
                      <option value="DATA_OWNER">Data Owner</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{row.department}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {row.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleResetPassword(row)}
                        disabled={savingId === row.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleChangePassword(row)}
                        disabled={savingId === row.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Change Pass
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    ไม่พบผู้ใช้ตามเงื่อนไข
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
